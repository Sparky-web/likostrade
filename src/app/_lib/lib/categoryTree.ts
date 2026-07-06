import type { CategoryChildrenMode } from "generated/prisma";

/**
 * Утилиты строгого дерева категорий для публичных страниц (крошки, сайдбар).
 *
 * В БД связь M2M; инвариант «один родитель, без циклов» держит роутер категорий,
 * а здесь на каждый обход стоит visited-защита — битые данные не вешают рендер.
 */

/** Минимальная форма категории для построения дерева (структурно совместима с categories.get). */
export type CategoryTreeSource = {
  id: string;
  title: string;
  isHidden: boolean;
  childrenMode: CategoryChildrenMode;
  sortOrder: number;
  parentCategories: { id: string }[];
  subcategories: { id: string }[];
};

/** Порядок каталога: sortOrder, затем алфавит — единый для плиток, карточек и дерева. */
export const byCatalogOrder = <T extends { sortOrder: number; title: string }>(a: T, b: T) =>
  a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "ru");

const indexById = <T extends CategoryTreeSource>(all: T[]) => new Map(all.map((category) => [category.id, category]));

/** Путь от корня до категории включительно (первый родитель — канонический). */
export function getCategoryPath<T extends CategoryTreeSource>(all: T[], categoryId: string): T[] {
  const byId = indexById(all);
  const path: T[] = [];
  const visited = new Set<string>();

  let current = byId.get(categoryId);
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    const parentId = current.parentCategories[0]?.id;
    current = parentId !== undefined ? byId.get(parentId) : undefined;
  }
  return path;
}

export type SidebarNode<T extends CategoryTreeSource> = {
  category: T;
  children: SidebarNode<T>[];
  /** Число видимых детей узла — счётчик в сайдбаре для свёрнутых/листовых узлов. */
  cardsCount: number;
};

export type SidebarContext<T extends CategoryTreeSource> = {
  /** Верхний SIDEBAR-узел непрерывной цепочки — страница каталога. */
  root: T;
  tree: SidebarNode<T>[];
  /** Кто подсвечен: сама категория, а для страниц-«позиций» — их родитель в дереве. */
  activeId: string;
  /** Путь от root до активного узла — вдоль него дерево развёрнуто (аккордеон как на evraz.pro). */
  activePathIds: Set<string>;
};

/**
 * Сайдбар-контекст страницы категории.
 *
 * Контекст есть, если категория — SIDEBAR-узел, либо её цепочка родителей выходит
 * на SIDEBAR-узел через узлы дерева и CARDS-«позиции». Дети CARDS-узлов в дерево
 * не включаются (решение ТЗ: карточки товаров не светятся в сайдбаре).
 */
export function getSidebarContext<T extends CategoryTreeSource>(
  all: T[],
  categoryId: string,
): SidebarContext<T> | null {
  const byId = indexById(all);
  const path = getCategoryPath(all, categoryId);
  if (path.length === 0) return null;

  // Ближайший к странице SIDEBAR-узел на пути, достижимый по каталожным связям:
  // каждый шаг вниз от него — через SIDEBAR (узел дерева) или CARDS (позиция)
  let anchor: T | null = null;
  for (let i = path.length - 1; i >= 0; i--) {
    const node = path[i];
    if (node === undefined) break;
    if (node.childrenMode === "SIDEBAR") {
      anchor = node;
      break;
    }
    const parent = path[i - 1];
    const parentKeepsContext =
      parent?.childrenMode === "SIDEBAR" || parent?.childrenMode === "CARDS" || parent?.childrenMode === "LIST";
    if (!parentKeepsContext) return null;
  }
  if (!anchor) return null;

  // Корень каталога — самый верхний SIDEBAR-предок непрерывной SIDEBAR-цепочки
  let root = anchor;
  const visitedUp = new Set<string>([root.id]);
  for (;;) {
    const parentId: string | undefined = root.parentCategories[0]?.id;
    const parent = parentId !== undefined ? byId.get(parentId) : undefined;
    if (!parent || parent.childrenMode !== "SIDEBAR" || visitedUp.has(parent.id)) break;
    visitedUp.add(parent.id);
    root = parent;
  }

  // Активный пункт — ближайший к странице узел пути, входящий в дерево
  // (узел в дереве ⇔ его родитель — SIDEBAR-узел, либо это сам root)
  let activeId = root.id;
  for (let i = path.length - 1; i >= 0; i--) {
    const node = path[i];
    if (node === undefined) break;
    const parent = path[i - 1];
    if (node.id === root.id || parent?.childrenMode === "SIDEBAR") {
      activeId = node.id;
      break;
    }
  }

  const rootIndex = path.findIndex((node) => node.id === root.id);
  const activeIndex = path.findIndex((node) => node.id === activeId);
  const activePathIds = new Set(
    rootIndex >= 0 && activeIndex >= rootIndex ? path.slice(rootIndex, activeIndex + 1).map((node) => node.id) : [root.id],
  );

  const visibleChildren = (node: T): T[] =>
    node.subcategories
      .map((sub) => byId.get(sub.id))
      .filter((sub): sub is T => sub !== undefined && !sub.isHidden)
      .sort(byCatalogOrder);

  const buildNodes = (node: T, visited: Set<string>): SidebarNode<T>[] =>
    visibleChildren(node).map((child) => {
      const guarded = visited.has(child.id);
      const children =
        !guarded && child.childrenMode === "SIDEBAR"
          ? buildNodes(child, new Set([...visited, child.id]))
          : [];
      return {
        category: child,
        children,
        cardsCount: visibleChildren(child).length,
      };
    });

  return { root, tree: buildNodes(root, new Set([root.id])), activeId, activePathIds };
}
