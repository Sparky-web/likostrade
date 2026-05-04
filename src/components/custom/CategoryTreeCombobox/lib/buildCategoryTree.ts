import type { RouterOutputs } from "~/trpc/react";

export type CategoryRecord = RouterOutputs["categories"]["get"][number];

export type CategoryTreeNode = {
  id: string;
  title: string;
  children: CategoryTreeNode[];
};

const sortNodesByTitle = (a: CategoryTreeNode, b: CategoryTreeNode) => a.title.localeCompare(b.title, "ru");

/** Строит лес корневых узлов по связям subcategories / parentCategories. */
export function buildCategoryTree(categories: CategoryRecord[]): CategoryTreeNode[] {
  const byId = new Map(categories.map((category) => [category.id, category]));

  const toNode = (category: CategoryRecord): CategoryTreeNode => {
    const children = category.subcategories
      .map((sub) => byId.get(sub.id))
      .filter((sub): sub is CategoryRecord => sub != null)
      .map(toNode)
      .sort(sortNodesByTitle);

    return { id: category.id, title: category.title, children };
  };

  return categories
    .filter((category) => category.parentCategories.every((parent) => !byId.has(parent.id)))
    .map(toNode)
    .sort(sortNodesByTitle);
}
