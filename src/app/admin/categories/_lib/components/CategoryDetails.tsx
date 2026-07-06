import { typo } from "lib";
import Image from "next/image";

import { FieldContent, FieldDescription, FieldLabel, VStack } from "~/components";
import { parseSections, SECTION_TYPE_LABELS } from "~/sections/schema";
import type { RouterOutputs } from "~/trpc/react";

type CategoryDetailsProps = {
  data: NonNullable<RouterOutputs["categories"]["getById"]>;
};

const EMPTY = "—";

const joinTitles = (items: { title: string }[]) => (items.length ? items.map((item) => item.title).join(", ") : EMPTY);

export const CategoryDetails = ({ data }: CategoryDetailsProps) => {
  const sections = parseSections(data.sections);

  return (
    <VStack gap="lg">
      <FieldContent>
        <FieldLabel>{typo("ID")}</FieldLabel>
        <FieldDescription>{data.id}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Название")}</FieldLabel>
        <FieldDescription>{data.title}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Скрыта на сайте")}</FieldLabel>
        <FieldDescription>{data.isHidden ? typo("Да") : typo("Нет")}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Название для лендинга")}</FieldLabel>
        <FieldDescription>{data.landingTitle || EMPTY}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Короткое описание")}</FieldLabel>
        <FieldDescription>{data.shortDescription || EMPTY}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Секции")}</FieldLabel>
        <FieldDescription>
          {sections.length > 0 ? sections.map((section) => SECTION_TYPE_LABELS[section.type]).join(", ") : EMPTY}
        </FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Изображение")}</FieldLabel>
        {data.imageId ? (
          <Image
            src={`/uploads/${data.imageId}`}
            alt={data.title}
            width={400}
            height={300}
            className="rounded-lg object-cover"
          />
        ) : (
          <FieldDescription>{EMPTY}</FieldDescription>
        )}
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Родительские категории")}</FieldLabel>
        <FieldDescription>{joinTitles(data.parentCategories)}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Подкатегории")}</FieldLabel>
        <FieldDescription>{joinTitles(data.subcategories)}</FieldDescription>
      </FieldContent>
    </VStack>
  );
};
