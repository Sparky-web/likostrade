import { typo } from "lib";
import Image from "next/image";

import {
  AdaptiveGrid,
  Card,
  CardContent,
  FieldContent,
  FieldDescription,
  FieldLabel,
  VStack,
} from "~/components";
import type { RouterOutputs } from "~/trpc/react";

type ProjectDetailsProps = {
  data: NonNullable<RouterOutputs["projects"]["getById"]>;
};

const EMPTY = "—";

const joinTitles = (items: { title: string }[]) => (items.length ? items.map((item) => item.title).join(", ") : EMPTY);

const renderHtml = (html: string | null | undefined) => {
  if (!html) return <FieldDescription>{EMPTY}</FieldDescription>;
  return (
    <Card size="sm">
      <CardContent>
        <div className="text-sm" dangerouslySetInnerHTML={{ __html: html }} />
      </CardContent>
    </Card>
  );
};

export const ProjectDetails = ({ data }: ProjectDetailsProps) => {
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
        <FieldLabel>{typo("Скрыт на сайте")}</FieldLabel>
        <FieldDescription>{data.isHidden ? typo("Да") : typo("Нет")}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Короткое описание")}</FieldLabel>
        <FieldDescription>{data.shortDescription || EMPTY}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Дата выполнения")}</FieldLabel>
        <FieldDescription>{data.dateCompleted || EMPTY}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Цена")}</FieldLabel>
        <FieldDescription>{data.price || EMPTY}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Срок выполнения")}</FieldLabel>
        <FieldDescription>{data.timeToComplete || EMPTY}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Категории")}</FieldLabel>
        <FieldDescription>{joinTitles(data.categories)}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Главное фото")}</FieldLabel>
        {data.mainImage ? (
          <Image
            src={`/uploads/${data.mainImage.id}`}
            alt={data.mainImage.alt ?? data.title}
            width={400}
            height={300}
            className="rounded-lg object-cover"
          />
        ) : (
          <FieldDescription>{EMPTY}</FieldDescription>
        )}
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Дополнительные фото")}</FieldLabel>
        {data.additionalImages.length ? (
          <AdaptiveGrid cols={{ base: 2 }} gap="md">
            {data.additionalImages.map((image) => (
              <Image
                key={image.id}
                src={`/uploads/${image.id}`}
                alt={image.alt ?? data.title}
                width={400}
                height={300}
                className="rounded-lg object-cover"
              />
            ))}
          </AdaptiveGrid>
        ) : (
          <FieldDescription>{EMPTY}</FieldDescription>
        )}
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Задача")}</FieldLabel>
        {renderHtml(data.task)}
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Процесс работы")}</FieldLabel>
        {renderHtml(data.workProgress)}
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Результат")}</FieldLabel>
        {renderHtml(data.result)}
      </FieldContent>
    </VStack>
  );
};
