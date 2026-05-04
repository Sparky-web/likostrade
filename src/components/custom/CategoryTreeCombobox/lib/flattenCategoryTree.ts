import type { CategoryTreeNode } from "./buildCategoryTree";

export type FlatCategoryTreeItem = {
  node: CategoryTreeNode;
  depth: number;
};

export function flattenCategoryTree(nodes: CategoryTreeNode[], depth = 0): FlatCategoryTreeItem[] {
  return nodes.flatMap((node) => [
    { node, depth },
    ...flattenCategoryTree(node.children, depth + 1),
  ]);
}
