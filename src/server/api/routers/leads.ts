import { zodRussian } from "lib";
import { createTableRouter, sendTelegramMessage } from "lib/server";

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
});

const leadsTableRouter = createTableRouter({
  dbTable: "Lead",
  procedures: {
    get: protectedProcedure,
    getById: protectedProcedure,
    create: publicProcedure,
    update: protectedProcedure,
    delete: protectedProcedure,
  },
  orderBy: { createdAt: "desc" },
  findManyArgs: {
    include: leadListInclude,
  },
  findUniqueArgs: {
    include: leadListInclude,
  },
  relationFields: ["files"] as const,
});

export const leadsRouter = createTRPCRouter({
  get: leadsTableRouter.get,
  getById: leadsTableRouter.getById,
  create: publicProcedure.input(createLeadInput).mutation(async ({ ctx, input }) => {
    const lead = await ctx.db.lead.create({
      data: {
        title: input.title,
        email: input.email,
        message: input.message,
        categoryId: input.categoryId ?? null,
        projectId: input.projectId ?? null,
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
