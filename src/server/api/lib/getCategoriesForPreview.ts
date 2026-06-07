import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "generated/prisma";
import { typo } from "lib";

/** Для превью: подкатегории — вся ветка, лист — только эта категория. */
export async function getCategoriesForPreview(db: PrismaClient, categoryId: string) {
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

  if (category.subcategories.length === 0) {
    return [categoryId];
  }

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
    categories.map((item) => [item.id, item.subcategories.map((subcategory) => subcategory.id)]),
  );

  const visited = new Set<string>();
  const collectSubtree = (id: string): string[] => {
    if (visited.has(id) || !childrenById.has(id)) return [];
    visited.add(id);
    return [id, ...(childrenById.get(id) ?? []).flatMap(collectSubtree)];
  };

  return collectSubtree(categoryId);
}
