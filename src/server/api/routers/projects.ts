import { zodRussian } from "lib";
import { createTableRouter } from "lib/server";

import { getCategoriesForPreview } from "../lib/getCategoriesForPreview";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const PREVIEW_LIMIT = 3;

const projectListInclude = {
  categories: true,
  mainImage: true,
  additionalImages: true,
} as const;

const projectsTableRouter = createTableRouter({
  dbTable: "Project",
  procedures: {
    get: publicProcedure,
    getById: publicProcedure,
    create: protectedProcedure,
    update: protectedProcedure,
    delete: protectedProcedure,
  },
  orderBy: { dateCompleted: "desc" },
  findManyArgs: {
    include: projectListInclude,
  },
  findUniqueArgs: {
    include: projectListInclude,
  },
  relationFields: ["categories", "additionalImages"] as const,
});

export const projectsRouter = createTRPCRouter({
  get: projectsTableRouter.get,
  getById: projectsTableRouter.getById,
  create: projectsTableRouter.create,
  update: projectsTableRouter.update,
  delete: projectsTableRouter.delete,

  getPreviewByCategory: publicProcedure
    .input(
      zodRussian.object({
        categoryId: zodRussian.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const categoryIds = await getCategoriesForPreview(ctx.db, input.categoryId);
      if (categoryIds.length === 0) return [];

      return ctx.db.project.findMany({
        where: {
          isHidden: false,
          categories: { some: { id: { in: categoryIds }, isHidden: false } },
        },
        orderBy: { dateCompleted: "desc" },
        include: projectListInclude,
        take: PREVIEW_LIMIT,
      });
    }),
});
