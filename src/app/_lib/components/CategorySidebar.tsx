import { typo } from "lib";

import { cn, HStack, Link, VStack } from "~/components";
import type { RouterOutputs } from "~/trpc/react";

import type { SidebarContext, SidebarNode } from "../lib/categoryTree";

type CategoryItem = RouterOutputs["categories"]["get"][number];

type CategorySidebarProps = {
  context: SidebarContext<CategoryItem>;
};

const SidebarNodeLink = ({ node, activeId, depth }: { node: SidebarNode<CategoryItem>; activeId: string; depth: number }) => {
  const isActive = node.category.id === activeId;
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
          <span>{typo(node.category.title)}</span>
          {node.cardsCount > 0 ? <span className="text-muted-foreground text-xs">{node.cardsCount}</span> : null}
        </HStack>
      </Link>
      {node.children.length > 0 ? (
        <VStack gap="3xs" className={cn(depth === 0 ? "border-border ml-3 border-l pl-2" : "ml-3 pl-2")}>
          {node.children.map((child) => (
            <SidebarNodeLink key={child.category.id} node={child} activeId={activeId} depth={depth + 1} />
          ))}
        </VStack>
      ) : null}
    </VStack>
  );
};

/** Дерево каталога в левой колонке; активный пункт подсвечен, у CARDS-узлов — счётчик позиций. */
export const CategorySidebar = ({ context }: CategorySidebarProps) => (
  <aside className="md:sticky md:top-24">
    <nav aria-label={typo("Каталог")}>
      <VStack gap="3xs" className="rounded-xl border p-2">
        {context.tree.map((node) => (
          <SidebarNodeLink key={node.category.id} node={node} activeId={context.activeId} depth={0} />
        ))}
      </VStack>
    </nav>
  </aside>
);
