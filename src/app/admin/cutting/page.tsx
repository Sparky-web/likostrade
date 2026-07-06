"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
import { typo } from "lib";
import { Plus, X } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { Button, CrudTableFormButton, Heading, HStack, NumberField, Skeleton, Text, VStack } from "~/components";
import { parseDecimal } from "~/cutting/calc";
import { api } from "~/trpc/react";

type PriceRowValues = { thickness: string; pricePerMeter: string; piercePrice: string };

/** null/пустая строка (очищенное поле) — невалидны; 0 допустим только как явный ввод цены. */
const parseCell = (value: unknown): number | null => {
  if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) return null;
  const parsed = parseDecimal(value);
  return Number.isFinite(parsed) ? parsed : null;
};

/** Прайс плазменной резки: строки по толщинам + настройки калькулятора (металл, обрезь). */
export default function CuttingPricesPage() {
  const { data, isPending, refetch } = api.cutting.getPublic.useQuery();
  const save = api.cutting.save.useMutation();

  const mappedValues = useMemo(() => {
    if (!data) return null;
    return {
      metalPricePerTon: String(data.metalPricePerTon),
      scrapPricePerKg: String(data.scrapPricePerKg),
      rows: data.rows.map((row) => ({
        thickness: String(row.thickness),
        pricePerMeter: String(row.pricePerMeter),
        piercePrice: String(row.piercePrice),
      })) satisfies PriceRowValues[] as PriceRowValues[],
    };
  }, [data]);

  const form = useForm({
    defaultValues: mappedValues ?? {
      metalPricePerTon: "",
      scrapPricePerKg: "",
      rows: [] satisfies PriceRowValues[] as PriceRowValues[],
    },
    onSubmit: async ({ value }) => {
      // Очищенные/невалидные ячейки — ошибка с номером строки, а не молчаливый 0
      const rows: { thickness: number; pricePerMeter: number; piercePrice: number }[] = [];
      for (const [index, row] of value.rows.entries()) {
        const thickness = parseCell(row.thickness);
        const pricePerMeter = parseCell(row.pricePerMeter);
        const piercePrice = parseCell(row.piercePrice);
        if (thickness === null || thickness <= 0 || pricePerMeter === null || piercePrice === null) {
          toast.error(typo(`Строка ${index + 1}: заполните толщину (> 0) и обе цены`));
          return;
        }
        rows.push({ thickness, pricePerMeter, piercePrice });
      }
      rows.sort((a, b) => a.thickness - b.thickness);

      const metalPricePerTon = parseCell(value.metalPricePerTon);
      const scrapPricePerKg = parseCell(value.scrapPricePerKg);
      if (metalPricePerTon === null || metalPricePerTon <= 0 || scrapPricePerKg === null || scrapPricePerKg < 0) {
        toast.error(typo("Заполните цену металла (> 0) и компенсацию за обрезь (>= 0)"));
        return;
      }

      try {
        await save.mutateAsync({ rows, metalPricePerTon, scrapPricePerKg });
        toast.success(typo("Прайс сохранён"));
        void refetch();
      } catch (error) {
        // Показать конкретную причину (дубль толщины, пустой прайс) вместо generic-текста
        const message = error instanceof Error ? error.message : null;
        toast.error(message ?? typo("Не удалось сохранить прайс"));
      }
    },
  });

  if (isPending || !mappedValues) return <Skeleton className="h-[400px]" />;

  return (
    <VStack gap="section" className="max-w-3xl">
      <Heading variant="h2">{typo("Цены резки")}</Heading>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <VStack gap="lg">
          <form.Field name="metalPricePerTon">
            {(field: AnyFieldApi) => <NumberField fieldApi={field} field={{ label: typo("Цена металла, руб/т") }} />}
          </form.Field>
          <form.Field name="scrapPricePerKg">
            {(field: AnyFieldApi) => (
              <NumberField fieldApi={field} field={{ label: typo("Компенсация за обрезь, руб/кг") }} />
            )}
          </form.Field>

          <VStack gap="sm">
            <Text variant="large">{typo("Прайс по толщинам")}</Text>
            <form.Field name="rows" mode="array">
              {(rowsField: AnyFieldApi) => {
                const rows = (rowsField.state.value ?? []) as PriceRowValues[];
                return (
                  <VStack gap="sm">
                    <HStack gap="sm" className="text-muted-foreground pr-12 text-sm">
                      <div className="flex-1">{typo("Толщина, мм")}</div>
                      <div className="flex-1">{typo("Рез, руб/м")}</div>
                      <div className="flex-1">{typo("Врезка, руб/шт")}</div>
                    </HStack>
                    {rows.map((_, index) => (
                      <HStack key={index} gap="sm" align="center">
                        {(["thickness", "pricePerMeter", "piercePrice"] as const).map((column) => (
                          <div key={column} className="flex-1">
                            <form.Field name={`rows[${index}].${column}`}>
                              {(field: AnyFieldApi) => <NumberField fieldApi={field} field={{ label: "" }} />}
                            </form.Field>
                          </div>
                        ))}
                        <Button type="button" variant="ghost" size="icon" onClick={() => rowsField.removeValue(index)}>
                          <X className="size-4" />
                        </Button>
                      </HStack>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-fit"
                      onClick={() => rowsField.pushValue({ thickness: "", pricePerMeter: "", piercePrice: "" })}
                    >
                      <Plus className="size-4" />
                      {typo("Добавить толщину")}
                    </Button>
                  </VStack>
                );
              }}
            </form.Field>
          </VStack>

          <CrudTableFormButton form={form} label={typo("Сохранить")} />
        </VStack>
      </form>
    </VStack>
  );
}
