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
  title: zodRussian.string().min(1),
  email: zodRussian.string().email(),
  message: zodRussian.string().optional(),
  categoryId: zodRussian.string().nullable().optional(),
  projectId: zodRussian.string().nullable().optional(),
  files: zodRussian.array(zodRussian.string()).optional(),
  /** Позиции калькулятора резки — заявка из спец-блока калькулятора. */
  calcItems: cuttingCalcItemsSchema.optional(),
});

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

    const telegramLines = ["Новая заявка", "", `Имя: ${lead.title}`, `Email: ${lead.email}`];

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
