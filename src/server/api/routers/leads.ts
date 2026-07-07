import { TRPCError } from "@trpc/server";
import type { Prisma } from "generated/prisma";
import { zodRussian } from "lib";
import { sendTelegramMessage } from "lib/server";

import { cuttingCalcItemsSchema, formatCalcItemsText } from "~/cutting/calc";
import { env } from "~/env";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const leadListInclude = {
  category: true,
  project: true,
  files: true,
} as const;

function getSiteBaseUrl(): string {
  if (env.AUTH_URL) {
    return env.AUTH_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

const createLeadInput = zodRussian.object({
  title: zodRussian.string().min(1).max(200),
  // Контакт заявки: телефон или email, без валидации формата (поле помечено «Email или телефон»).
  email: zodRussian.string().min(1).max(320),
  message: zodRussian.string().max(5000).optional(),
  categoryId: zodRussian.string().max(200).nullable().optional(),
  projectId: zodRussian.string().max(200).nullable().optional(),
  files: zodRussian.array(zodRussian.string().max(300)).max(5).optional(),
  /** Позиции калькулятора резки — заявка из спец-блока калькулятора. */
  calcItems: cuttingCalcItemsSchema.optional(),
});

/**
 * Простой рейт-лимит публичной формы по IP: скользящее окно в памяти процесса.
 * Против ботов-спамеров достаточно; при рестарте сбрасывается — это ок.
 */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_LEADS = 10;
const leadTimestampsByIp = new Map<string, number[]>();

function assertLeadRateLimit(ip: string) {
  const now = Date.now();
  const recent = (leadTimestampsByIp.get(ip) ?? []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_LEADS) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Слишком много заявок, попробуйте позже" });
  }
  recent.push(now);
  leadTimestampsByIp.set(ip, recent);
  // не копим чужие IP бесконечно
  if (leadTimestampsByIp.size > 10_000) {
    for (const [key, list] of leadTimestampsByIp) {
      if (list.every((ts) => now - ts >= RATE_LIMIT_WINDOW_MS)) leadTimestampsByIp.delete(key);
    }
  }
}

export const leadsRouter = createTRPCRouter({
  get: protectedProcedure.query(({ ctx }) =>
    ctx.db.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: leadListInclude,
    }),
  ),

  getById: protectedProcedure
    .input(zodRussian.object({ id: zodRussian.string() }))
    .query(({ ctx, input }) =>
      ctx.db.lead.findUnique({
        where: { id: input.id },
        include: leadListInclude,
      }),
    ),

  create: publicProcedure.input(createLeadInput).mutation(async ({ ctx, input }) => {
    assertLeadRateLimit(ctx.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local");
    const calcItems = input.calcItems ?? [];
    const lead = await ctx.db.lead.create({
      data: {
        title: input.title,
        email: input.email,
        message: input.message,
        categoryId: input.categoryId ?? null,
        projectId: input.projectId ?? null,
        calcItems: calcItems as Prisma.InputJsonValue,
        ...(input.files && input.files.length > 0
          ? {
              files: {
                connect: input.files.map((id) => ({ id })),
              },
            }
          : {}),
      },
      include: leadListInclude,
    });

    const telegramLines = ["Новая заявка", "", `Имя: ${lead.title}`, `Контакт: ${lead.email}`];

    if (lead.message) {
      telegramLines.push(`Сообщение: ${lead.message}`);
    }

    if (lead.category) {
      telegramLines.push(`Категория: ${lead.category.title}`);
    }

    if (lead.project) {
      telegramLines.push(`Проект: ${lead.project.title}`);
    }

    if (lead.files.length > 0) {
      telegramLines.push(`Вложения: ${lead.files.length}`);
    }

    if (calcItems.length > 0) {
      telegramLines.push("", formatCalcItemsText(calcItems));
    }

    telegramLines.push("", `Открыть в админке: ${getSiteBaseUrl()}/admin/leads?id=${lead.id}`);

    try {
      await sendTelegramMessage({
        botToken: env.TELEGRAM_BOT_TOKEN,
        chatId: env.TELEGRAM_CHAT_ID,
        message: telegramLines.join("\n"),
        proxyUrl: env.TELEGRAM_PROXY_URL,
      });
    } catch (error) {
      console.error("Не удалось отправить уведомление в Telegram", error);
    }

    return lead;
  }),
});
