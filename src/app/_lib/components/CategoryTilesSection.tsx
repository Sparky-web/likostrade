import { typo } from "lib";

import { AdaptiveGrid, GalleryBlock } from "~/components";
import type { RouterOutputs } from "~/trpc/react";

import { byCatalogOrder } from "../lib/categoryTree";
import galleryFallbackImage from "../lib/metal.jpg";

/** Элемент списка категорий с полями, нужными для карточки (из get или вложенных subcategories). */
export type CategoryTileItem = Pick<
  RouterOutputs["categories"]["get"][number],
  "id" | "title" | "imageId" | "sortOrder"
>;

interface CategoryTilesSectionProps {
  categories: CategoryTileItem[];
}

/** Сетка карточек категорий для главной и страницы вложенных категорий. */
export function CategoryTilesSection({ categories }: CategoryTilesSectionProps) {
  if (categories.length === 0) return null;

  const sorted = [...categories].sort(byCatalogOrder);

  return (
    <AdaptiveGrid cols={{ base: 1, lg: 2, xl: 3 }}>
      {sorted.map((category) => (
        <GalleryBlock
          key={category.id}
          href={`/categories/${category.id}`}
          title={typo(category.title)}
          image={galleryFallbackImage}
          uploadSrc={category.imageId ? `/uploads/${category.imageId}` : undefined}
        />
      ))}
    </AdaptiveGrid>
  );
}
