import type { CategoryRecord, CategoryTreeNode } from "../lib/buildCategoryTree";

export type CategoryCheckState = "checked" | "indeterminate" | "unchecked";

export function collectSubtreeIds(node: CategoryTreeNode): string[] {
  return [node.id, ...node.children.flatMap(collectSubtreeIds)];
}

export function getAncestorIds(categoryId: string, categories: CategoryRecord[]): string[] {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const ancestors = new Set<string>();
  const stack = [categoryId];

  while (stack.length > 0) {
    const id = stack.pop();
    if (id == null) continue;

    const category = byId.get(id);
    if (category == null) continue;

    for (const parent of category.parentCategories) {
      if (!ancestors.has(parent.id)) {
        ancestors.add(parent.id);
        stack.push(parent.id);
      }
    }
  }

  return [...ancestors];
}

/** Все id поддерева присутствуют в выборе. */
export function isSubtreeFullySelected(node: CategoryTreeNode, selected: Set<string>): boolean {
  return collectSubtreeIds(node).every((id) => selected.has(id));
}

/**
 * Узел считается полностью выбранным, если в стейте есть всё поддерево
 * или полностью выбраны все дочерние ветки (для отображения родителя вместо детей).
 */
export function isEffectivelyFullySelected(node: CategoryTreeNode, selected: Set<string>): boolean {
  if (isSubtreeFullySelected(node, selected)) return true;
  if (node.children.length === 0) return false;
  return node.children.every((child) => isEffectivelyFullySelected(child, selected));
}

/**
 * Дополняет стейт: если выбраны все дочерние ветки в дереве —
 * добавляет родителя и всё его поддерево.
 */
export function normalizeCategorySelection(selected: string[], tree: CategoryTreeNode[]): string[] {
  const next = new Set(selected);

  const walk = (node: CategoryTreeNode): void => {
    for (const child of node.children) walk(child);

    if (node.children.length === 0) return;

    const allChildrenFullySelected = node.children.every((child) => isEffectivelyFullySelected(child, next));
    if (!allChildrenFullySelected) return;

    for (const id of collectSubtreeIds(node)) next.add(id);
  };

  for (const root of tree) walk(root);

  return [...next];
}

export function toggleCategorySelection(
  selected: string[],
  node: CategoryTreeNode,
  select: boolean,
  categories: CategoryRecord[],
  tree: CategoryTreeNode[],
): string[] {
  const next = new Set(selected);
  const subtreeIds = collectSubtreeIds(node);

  if (select) {
    for (const id of subtreeIds) next.add(id);
  } else {
    for (const id of subtreeIds) next.delete(id);
    for (const id of getAncestorIds(node.id, categories)) next.delete(id);
  }

  return normalizeCategorySelection([...next], tree);
}

/** Минимальный набор id для чипов: родитель вместо полностью выбранного поддерева. */
export function getDisplayCategoryIds(selected: string[], roots: CategoryTreeNode[]): string[] {
  const selectedSet = new Set(selected);
  const display: string[] = [];

  const visit = (node: CategoryTreeNode) => {
    if (isEffectivelyFullySelected(node, selectedSet)) {
      display.push(node.id);
      return;
    }

    node.children.forEach(visit);
  };

  roots.forEach(visit);
  return display;
}

export function getCategoryCheckState(node: CategoryTreeNode, selected: string[]): CategoryCheckState {
  const selectedSet = new Set(selected);
  const subtreeIds = collectSubtreeIds(node);
  const selectedCount = subtreeIds.filter((id) => selectedSet.has(id)).length;

  if (selectedCount === 0) return "unchecked";
  if (isEffectivelyFullySelected(node, selectedSet)) return "checked";
  return "indeterminate";
}

export function removeCategoryBranch(
  selected: string[],
  node: CategoryTreeNode,
  categories: CategoryRecord[],
  tree: CategoryTreeNode[],
): string[] {
  return toggleCategorySelection(selected, node, false, categories, tree);
}

export function areCategorySelectionsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}
