import { zodRussian } from "lib";

import { getCategoriesForPreview } from "../lib/getCategoriesForPreview";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const PREVIEW_LIMIT = 3;

const videoListInclude = {
  categories: true,
} as const;

const videoOrderBy = { title: "asc" } as const;

/** Поля формы видео; categories — массив id. */
const videoFieldsInput = zodRussian.object({
  title: zodRussian.string().min(1),
  description: zodRussian.string().nullable(),
  url: zodRussian.string(),
  categories: zodRussian.array(zodRussian.string()),
});

// id (слаг из translit) задаётся только при создании; в update пришедший с клиента id отбрасывается схемой
const createVideoInput = videoFieldsInput.extend({ id: zodRussian.string().min(1) });

export const videosRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) =>
    ctx.db.video.findMany({
      orderBy: videoOrderBy,
      include: videoListInclude,
    }),
  ),

  getById: publicProcedure
    .input(zodRussian.object({ id: zodRussian.string() }))
    .query(({ ctx, input }) =>
      ctx.db.video.findUnique({
        where: { id: input.id },
        include: videoListInclude,
      }),
    ),

  create: protectedProcedure.input(createVideoInput).mutation(({ ctx, input }) => {
    const { categories, ...scalars } = input;
    return ctx.db.video.create({
      data: {
        ...scalars,
        categories: { connect: categories.map((id) => ({ id })) },
      },
    });
  }),

  update: protectedProcedure
    .input(zodRussian.object({ id: zodRussian.string(), data: videoFieldsInput }))
    .mutation(async ({ ctx, input }) => {
      const { categories, ...scalars } = input.data;
      await ctx.db.video.update({
        where: { id: input.id },
        data: {
          ...scalars,
          // set — полная замена состава связи по списку id из формы
          categories: { set: categories.map((id) => ({ id })) },
        },
      });
      return true;
    }),

  delete: protectedProcedure
    .input(zodRussian.object({ id: zodRussian.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.video.delete({ where: { id: input.id } });
      return true;
    }),

  getPreview: publicProcedure.query(({ ctx }) =>
    ctx.db.video.findMany({
      orderBy: videoOrderBy,
      include: videoListInclude,
      take: PREVIEW_LIMIT,
    }),
  ),

  getPreviewByCategory: publicProcedure
    .input(
      zodRussian.object({
        categoryId: zodRussian.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const categoryIds = await getCategoriesForPreview(ctx.db, input.categoryId);
      if (categoryIds.length === 0) return [];

      return ctx.db.video.findMany({
        where: {
          categories: { some: { id: { in: categoryIds }, isHidden: false } },
        },
        orderBy: videoOrderBy,
        include: videoListInclude,
        take: PREVIEW_LIMIT,
      });
    }),
});
