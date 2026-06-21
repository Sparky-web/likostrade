import { typo } from "lib";

import { EmailCopy } from "~/app/_lib/components/EmailCopy";
import { FieldContent, FieldDescription, FieldLabel, Link, VStack } from "~/components";
import type { RouterOutputs } from "~/trpc/react";

type LeadDetailsProps = {
  data: NonNullable<RouterOutputs["leads"]["getById"]>;
};

const EMPTY = "—";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

const isImageId = (id: string) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(id);

export const LeadDetails = ({ data }: LeadDetailsProps) => {
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
        <FieldLabel>{typo("Email")}</FieldLabel>
        <FieldDescription>
          <EmailCopy email={data.email} trackGoals={false} />
        </FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Категория")}</FieldLabel>
        <FieldDescription>{data.category?.title ?? EMPTY}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Проект")}</FieldLabel>
        <FieldDescription>{data.project?.title ?? EMPTY}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Сообщение")}</FieldLabel>
        <FieldDescription>{data.message || EMPTY}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Создана")}</FieldLabel>
        <FieldDescription>{dateFormatter.format(data.createdAt)}</FieldDescription>
      </FieldContent>

      <FieldContent>
        <FieldLabel>{typo("Вложения")}</FieldLabel>
        {data.files.length > 0 ? (
          <VStack gap="sm">
            {data.files.map((file) => (
              <VStack key={file.id} gap="xs">
                <FieldDescription>{file.id}</FieldDescription>
                {isImageId(file.id) ? (
                  <Link href={`/uploads/${file.id}`} target="_blank" rel="noreferrer noopener">
                    <img
                      src={`/uploads/${file.id}`}
                      alt={file.alt ?? file.id}
                      className="max-w-[400px] rounded-lg object-cover"
                    />
                  </Link>
                ) : (
                  <Link href={`/uploads/${file.id}`} target="_blank" rel="noreferrer noopener" variant="underline">
                    {typo("Скачать файл")}
                  </Link>
                )}
              </VStack>
            ))}
          </VStack>
        ) : (
          <FieldDescription>{EMPTY}</FieldDescription>
        )}
      </FieldContent>
    </VStack>
  );
};
