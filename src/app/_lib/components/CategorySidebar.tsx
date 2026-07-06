import { typo } from "lib";
import { ChevronDown, ChevronRight } from "lucide-react";

import { cn, HStack, Link, VStack } from "~/components";
import type { RouterOutputs } from "~/trpc/react";

import type { SidebarContext, SidebarNode } from "../lib/categoryTree";

type CategoryItem = RouterOutputs["categories"]["getTree"][number];

type CategorySidebarProps = {
  context: SidebarContext<CategoryItem>;
};

type NodeLinkProps = {
  node: SidebarNode<CategoryItem>;
  context: SidebarContext<CategoryItem>;
  depth: number;
};

/**
 * Пункт дерева. Ветки разворачиваются только вдоль пути к активной категории
 * (аккордеон как на evraz.pro): клик по пункту открывает его страницу и ветку.
 */
const SidebarNodeLink = ({ node, context, depth }: NodeLinkProps) => {
  const isActive = node.category.id === context.activeId;
  const isExpanded = node.children.length > 0 && context.activePathIds.has(node.category.id);

  return (
    <VStack gap="3xs">
      <Link
        href={`/categories/${node.category.id}`}
        className={cn(
          "hover:bg-secondary block w-full rounded-md px-3 py-2 text-sm transition-colors",
          isActive && "bg-secondary text-primary font-semibold",
        )}
      >
        <HStack gap="sm" align="center" justify="between">
          <span className="min-w-0">{typo(node.category.title)}</span>
          {node.children.length > 0 ? (
            isExpanded ? (
              <ChevronDown className="text-muted-foreground size-4 shrink-0" aria-hidden />
            ) : (
              <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
            )
          ) : node.cardsCount > 0 ? (
            <span className="text-muted-foreground text-xs">{node.cardsCount}</span>
          ) : null}
        </HStack>
      </Link>
      {isExpanded ? (
        <VStack gap="3xs" className={cn("ml-3 pl-2", depth === 0 && "border-border border-l")}>
          {node.children.map((child) => (
            <SidebarNodeLink key={child.category.id} node={child} context={context} depth={depth + 1} />
          ))}
        </VStack>
      ) : null}
    </VStack>
  );
};

/** Дерево каталога в левой колонке; активный пункт подсвечен, ветка активного пути развёрнута. */
export const CategorySidebar = ({ context }: CategorySidebarProps) => (
  <aside className="md:sticky md:top-24">
    <nav aria-label={typo("Каталог")}>
      <VStack gap="3xs" className="rounded-xl border p-2">
        {context.tree.map((node) => (
          <SidebarNodeLink key={node.category.id} node={node} context={context} depth={0} />
        ))}
      </VStack>
    </nav>
  </aside>
);
