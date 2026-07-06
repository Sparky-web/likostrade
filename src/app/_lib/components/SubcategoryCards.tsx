import { typo } from "lib";

import { AdaptiveGrid, ProductCard } from "~/components";
import type { RouterOutputs } from "~/trpc/react";

export type SubcategoryCardItem = Pick<
  RouterOutputs["categories"]["get"][number],
  "id" | "title" | "shortDescription" | "imageId" | "sortOrder"
>;

type SubcategoryCardsProps = {
  categories: SubcategoryCardItem[];
};

/** Подкатегории-«позиции» карточками товара (childrenMode = CARDS и спец-блок «Список подкатегорий»). */
export const SubcategoryCards = ({ categories }: SubcategoryCardsProps) => {
  if (categories.length === 0) return null;

  const sorted = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "ru"),
  );

  return (
    <AdaptiveGrid cols={{ base: 1, md: 2, xl: 3 }} gap="xl">
      {sorted.map((category) => (
        <ProductCard
          key={category.id}
          href={`/categories/${category.id}`}
          image={category.imageId ? `/uploads/${category.imageId}` : undefined}
          title={typo(category.title)}
          description={category.shortDescription ? typo(category.shortDescription) : ""}
        />
      ))}
    </AdaptiveGrid>
  );
};
