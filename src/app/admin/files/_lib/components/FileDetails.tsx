import { typo } from "lib";
import Image from "next/image";

import { FieldContent, FieldDescription, FieldLabel, Link, VStack } from "~/components";
import type { RouterOutputs } from "~/trpc/react";

type FileDetailsProps = {
  data: NonNullable<RouterOutputs["files"]["getById"]>;
};

const EMPTY = "—";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

const joinTitles = (items: { title: string }[]) =>
  items.length ? items.map((item) => item.title).join(", ") : EMPTY;

// Грубая эвристика по расширению; для строгого определения типа понадобилось бы поле в БД
const isImageId = (id: string) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(id);

export const FileDetails = ({ data }: FileDetailsProps) => {
  const projectTitles = [
    ...data.projectMainImages.map((p) => p.title),
    ...data.projectAdditionalImages.map((p) => p.title),
  ];

  return (
    <VStack gap="lg">
      <FieldContent>
        <FieldLabel>{typo("ID")}</FieldLabel>
        <FieldDescription>{data.id}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Alt")}</FieldLabel>
        <FieldDescription>{data.alt || EMPTY}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Превью")}</FieldLabel>
        {isImageId(data.id) ? (
          <Image
            src={`/uploads/${data.id}`}
            alt={data.alt ?? data.id}
            width={400}
            height={300}
            className="rounded-lg object-cover"
          />
        ) : (
          <FieldDescription>
            <Link
              href={`/uploads/${data.id}`}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2"
            >
              {typo("Скачать файл")}
            </Link>
          </FieldDescription>
        )}
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Создан")}</FieldLabel>
        <FieldDescription>{dateFormatter.format(data.createdAt)}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Обновлён")}</FieldLabel>
        <FieldDescription>{dateFormatter.format(data.updatedAt)}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Используется в категориях")}</FieldLabel>
        <FieldDescription>{joinTitles(data.categories)}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Используется в проектах")}</FieldLabel>
        <FieldDescription>{projectTitles.length ? projectTitles.join(", ") : EMPTY}</FieldDescription>
      </FieldContent>
    </VStack>
  );
};
