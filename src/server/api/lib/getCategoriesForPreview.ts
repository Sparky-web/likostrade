import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "generated/prisma";

async function getCategoryGraph(db: PrismaClient, categoryId: string) {
  const categories = await db.category.findMany({
    select: {
      id: true,
      isHidden: true,
      inheritProjectsFromParent: true,
      parentCategories: { select: { id: true } },
      subcategories: {
        where: { isHidden: false },
        select: { id: true },
      },
    },
  });
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const category = categoriesById.get(categoryId);

  if (!category || category.isHidden) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Категория не найдена",
    });
  }

  return { categories, categoriesById, category };
}

function collectCategorySubtree(
  categories: Awaited<ReturnType<typeof getCategoryGraph>>["categories"],
  sourceCategoryId: string,
) {
  const childrenById = new Map(categories.map((item) => [item.id, item.subcategories.map((subcategory) => subcategory.id)]));

  const visited = new Set<string>();
  const collectSubtree = (id: string): string[] => {
    if (visited.has(id) || !childrenById.has(id)) return [];
    visited.add(id);
    return [id, ...(childrenById.get(id) ?? []).flatMap(collectSubtree)];
  };

  return collectSubtree(sourceCategoryId);
}

/** Для обычного превью: подкатегории — вся ветка, лист — только эта категория. */
export async function getCategoriesForPreview(db: PrismaClient, categoryId: string) {
  const { categories, category } = await getCategoryGraph(db, categoryId);
  return collectCategorySubtree(categories, category.id);
}

/**
 * Для работ категория с inheritProjectsFromParent использует родителя как источник; цепочка флагов
 * поднимает источник до первого предка без флага. Инвариант дерева гарантирует одного родителя.
 */
export async function getProjectCategoriesForPreview(db: PrismaClient, categoryId: string) {
  const { categories, categoriesById, category } = await getCategoryGraph(db, categoryId);

  let sourceCategory = category;
  const sourcePath = new Set([sourceCategory.id]);
  while (sourceCategory.inheritProjectsFromParent) {
    const parentId = sourceCategory.parentCategories[0]?.id;
    if (parentId === undefined || sourcePath.has(parentId)) break;

    const parent = categoriesById.get(parentId);
    if (!parent) break;

    sourcePath.add(parent.id);
    sourceCategory = parent;
  }

  return {
    sourceCategoryId: sourceCategory.id,
    categoryIds: collectCategorySubtree(categories, sourceCategory.id),
  };
}
