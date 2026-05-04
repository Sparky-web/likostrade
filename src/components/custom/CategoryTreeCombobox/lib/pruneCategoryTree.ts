import type { CategoryTreeNode } from "./buildCategoryTree";

/** Оставляет ветки, ведущие к разрешённым id (сами узлы и предки). */
export function pruneCategoryTree(nodes: CategoryTreeNode[], allowedIds: Set<string>): CategoryTreeNode[] {
  return nodes.flatMap((node) => {
    const children = pruneCategoryTree(node.children, allowedIds);
    if (allowedIds.has(node.id) || children.length > 0) {
      return [{ ...node, children }];
    }
    return [];
  });
}
