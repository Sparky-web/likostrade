"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
import { typo } from "lib";
import { Plus, X } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { Button, CrudTableFormButton, Heading, HStack, NumberField, Skeleton, Text, VStack } from "~/components";
import { api } from "~/trpc/react";

type PriceRowValues = { thickness: string; pricePerMeter: string; piercePrice: string };

const toNumber = (value: unknown): number => {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value.replace(",", ".")) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
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
      const rows = value.rows
        .map((row) => ({
          thickness: toNumber(row.thickness),
          pricePerMeter: toNumber(row.pricePerMeter),
          piercePrice: toNumber(row.piercePrice),
        }))
        .filter((row) => row.thickness > 0)
        .sort((a, b) => a.thickness - b.thickness);

      try {
        await save.mutateAsync({
          rows,
          metalPricePerTon: toNumber(value.metalPricePerTon),
          scrapPricePerKg: toNumber(value.scrapPricePerKg),
        });
        toast.success(typo("Прайс сохранён"));
        void refetch();
      } catch (error) {
        console.error(error);
        toast.error(typo("Не удалось сохранить прайс"));
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
