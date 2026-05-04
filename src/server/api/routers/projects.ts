import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "generated/prisma";
import { typo, zodRussian } from "lib";
import { createTableRouter } from "lib/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const CATEGORY_PREVIEW_LIMIT = 3;

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

async function getVisibleProjectsByCategoryIds(
  db: PrismaClient,
  categoryIds: string[],
  excludeProjectIds: string[] = [],
) {
  if (categoryIds.length === 0) {
    return [];
  }

  return db.project.findMany({
    where: {
      isHidden: false,
      ...(excludeProjectIds.length > 0 ? { id: { notIn: excludeProjectIds } } : {}),
      categories: { some: { id: { in: categoryIds }, isHidden: false } },
    },
    orderBy: { dateCompleted: "desc" },
    include: projectListInclude,
  });
}

/** Id категории и всех её видимых потомков. */
async function collectCategorySubtreeIds(db: PrismaClient, rootCategoryId: string) {
  const categories = await db.category.findMany({
    where: { isHidden: false },
    select: {
      id: true,
      subcategories: {
        where: { isHidden: false },
        select: { id: true },
      },
    },
  });

  const childrenById = new Map(
    categories.map((category) => [category.id, category.subcategories.map((subcategory) => subcategory.id)]),
  );

  const collected = new Set<string>();
  const queue = [rootCategoryId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (currentId == null || collected.has(currentId) || !childrenById.has(currentId)) {
      continue;
    }

    collected.add(currentId);

    for (const childId of childrenById.get(currentId) ?? []) {
      queue.push(childId);
    }
  }

  return [...collected];
}

async function getPreviewProjectsByCategory(db: PrismaClient, categoryId: string) {
  const category = await db.category.findUnique({
    where: { id: categoryId },
    include: {
      subcategories: {
        where: { isHidden: false },
        select: { id: true },
      },
    },
  });

  if (!category || category.isHidden) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: typo(`Категория не найдена`),
    });
  }

  // Родительская категория: последние работы из неё и всех подкатегорий.
  if (category.subcategories.length > 0) {
    const subtreeCategoryIds = await collectCategorySubtreeIds(db, categoryId);
    const projects = await getVisibleProjectsByCategoryIds(db, subtreeCategoryIds);
    return projects.slice(0, CATEGORY_PREVIEW_LIMIT);
  }

  const categoryProjects = await getVisibleProjectsByCategoryIds(db, [categoryId]);
  return categoryProjects.slice(0, CATEGORY_PREVIEW_LIMIT);
}

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
      return getPreviewProjectsByCategory(ctx.db, input.categoryId);
    }),
});
