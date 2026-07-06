import { typo } from "lib";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

import { AdaptiveGrid, Heading, Link, Text } from "~/components";
import type { RouterOutputs } from "~/trpc/react";

export type SubcategoryCardItem = Pick<
  RouterOutputs["categories"]["get"][number],
  "id" | "title" | "shortDescription" | "imageId" | "sortOrder"
>;

/** Вид списка позиций: крупные карточки (категории каталога) или компактные строки (исполнения). */
export type SubcategoryCardsVariant = "cards" | "list";

type SubcategoryCardsProps = {
  categories: SubcategoryCardItem[];
  variant?: SubcategoryCardsVariant;
};

const PositionImage = ({ category, sizes, iconClassName }: { category: SubcategoryCardItem; sizes: string; iconClassName: string }) =>
  category.imageId ? (
    <Image
      src={`/uploads/${category.imageId}`}
      alt={category.title}
      fill
      sizes={sizes}
      className="bg-white object-contain p-2 transition-transform duration-300 group-hover:scale-105"
    />
  ) : (
    <div className="text-muted-foreground/50 flex h-full items-center justify-center">
      <ImageIcon className={iconClassName} aria-hidden />
    </div>
  );

/** Крупная карточка позиции: фото сверху, заголовок и описание под ним. */
const PositionCard = ({ category }: { category: SubcategoryCardItem }) => (
  <Link href={`/categories/${category.id}`} className="group block w-full no-underline">
    <div className="flex flex-col gap-4">
      <div className="bg-secondary relative aspect-4/3 w-full overflow-hidden rounded-xl border">
        <PositionImage category={category} sizes="(max-width: 768px) 100vw, 400px" iconClassName="size-12" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Heading variant="h4" maxLines={3}>
          {typo(category.title)}
        </Heading>
        {category.shortDescription ? (
          <Text variant="small" color="supplementary" maxLines={4}>
            {typo(category.shortDescription)}
          </Text>
        ) : null}
      </div>
    </div>
  </Link>
);

/** Компактная строка позиции как на evraz.pro: небольшое фото сбоку, заголовок и описание. */
const PositionRow = ({ category }: { category: SubcategoryCardItem }) => (
  <Link href={`/categories/${category.id}`} className="group block w-full no-underline">
    <div className="flex items-start gap-4">
      <div className="bg-secondary relative size-24 shrink-0 overflow-hidden rounded-lg border">
        <PositionImage category={category} sizes="96px" iconClassName="size-8" />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Heading variant="h4" maxLines={2}>
          {typo(category.title)}
        </Heading>
        {category.shortDescription ? (
          <Text variant="small" color="supplementary" maxLines={3}>
            {typo(category.shortDescription)}
          </Text>
        ) : null}
      </div>
    </div>
  </Link>
);

/** Подкатегории-«позиции» карточками или строками (childrenMode CARDS/LIST/SIDEBAR, спец-блок «Список подкатегорий»). */
export const SubcategoryCards = ({ categories, variant = "cards" }: SubcategoryCardsProps) => {
  if (categories.length === 0) return null;

  const sorted = [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, "ru"),
  );

  if (variant === "list") {
    return (
      <AdaptiveGrid cols={{ base: 1, md: 2 }} gap="xl">
        {sorted.map((category) => (
          <PositionRow key={category.id} category={category} />
        ))}
      </AdaptiveGrid>
    );
  }

  return (
    <AdaptiveGrid cols={{ base: 1, md: 2, xl: 3 }} gap="xl">
      {sorted.map((category) => (
        <PositionCard key={category.id} category={category} />
      ))}
    </AdaptiveGrid>
  );
};
