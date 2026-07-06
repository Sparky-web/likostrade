import { typo } from "lib";

import { EmailCopy } from "~/app/_lib/components/EmailCopy";
import { FieldContent, FieldDescription, FieldLabel, HStack, Link, Text, VStack } from "~/components";
import { calcItemsTotal, formatRub, parseCalcItems } from "~/cutting/calc";
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
  const calcItems = parseCalcItems(data.calcItems);

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

      {calcItems.length > 0 ? (
        <FieldContent>
          <FieldLabel>{typo("Расчёт плазменной резки")}</FieldLabel>
          <VStack gap="sm">
            {calcItems.map((item) => (
              <HStack key={item.id} gap="md" align="center" justify="between" className="rounded-lg border p-3">
                <VStack className="min-w-0 gap-0.5">
                  <span className="text-sm font-medium">
                    {item.shapeLabel} — {item.sizes}
                  </span>
                  <Text variant="small" color="supplementary">
                    {typo(
                      `${item.amount} шт. × ${formatRub(item.pricePerUnit)}${item.weightKg !== null ? ` · ${item.weightKg} кг/шт` : ""} · резка ${formatRub(item.cuttingCostPerUnit)}/шт`,
                    )}
                  </Text>
                </VStack>
                <span className="shrink-0 text-sm font-semibold whitespace-nowrap">{formatRub(item.totalPrice)}</span>
              </HStack>
            ))}
            <HStack justify="between" align="center">
              <Text variant="small">{typo("Итого по расчёту")}</Text>
              <span className="font-semibold">{formatRub(calcItemsTotal(calcItems))}</span>
            </HStack>
          </VStack>
        </FieldContent>
      ) : null}

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
