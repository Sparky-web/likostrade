import { zodRussian } from "lib";
import { createTableRouter } from "lib/server";

import { getCategoriesForPreview } from "../lib/getCategoriesForPreview";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const PREVIEW_LIMIT = 3;

const videoListInclude = {
  categories: true,
} as const;

const videosTableRouter = createTableRouter({
  dbTable: "Video",
  procedures: {
    get: publicProcedure,
    getById: publicProcedure,
    create: protectedProcedure,
    update: protectedProcedure,
    delete: protectedProcedure,
  },
  orderBy: { title: "asc" },
  findManyArgs: {
    include: videoListInclude,
  },
  findUniqueArgs: {
    include: videoListInclude,
  },
  relationFields: ["categories"] as const,
});

export const videosRouter = createTRPCRouter({
  get: videosTableRouter.get,
  getById: videosTableRouter.getById,
  create: videosTableRouter.create,
  update: videosTableRouter.update,
  delete: videosTableRouter.delete,

  getPreview: publicProcedure.query(({ ctx }) =>
    ctx.db.video.findMany({
      orderBy: { title: "asc" },
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
        orderBy: { title: "asc" },
        include: videoListInclude,
        take: PREVIEW_LIMIT,
      });
    }),
});
