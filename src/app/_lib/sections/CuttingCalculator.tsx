"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
import { typo } from "lib";
import { Trash2 } from "lucide-react";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
  Heading,
  HStack,
  Label,
  NumberField,
  SelectField,
  type SelectFieldOption,
  SwitchField,
  Text,
  VStack,
} from "~/components";
import type { CuttingCalcItem, CuttingPriceRowData, CuttingShape } from "~/cutting/calc";
import { calcItemsTotal, calculateCutting, CUTTING_SHAPES, formatRub, parsePositiveDecimal } from "~/cutting/calc";

import { RequestFormDialog } from "../components/RequestFormDialog";
import calculateCircle from "../lib/cutting/calculate-circle.png";
import calculateOther from "../lib/cutting/calculate-other.jpg";
import calculateSquare from "../lib/cutting/calculate-square.png";
import calculateTriangle from "../lib/cutting/calculate-triangle.png";

type CuttingCalculatorProps = {
  categoryId: string;
  priceRows: CuttingPriceRowData[];
  defaultMetalPricePerTon: number;
  scrapPricePerKg: number;
};

/** Визуализации типов изделий из исходного калькулятора (likos-next/images). */
const SHAPE_IMAGES: Record<CuttingShape, StaticImageData> = {
  square: calculateSquare,
  circle: calculateCircle,
  triangle: calculateTriangle,
  other: calculateOther,
};

/** Типовая толщина заготовки для фигуры (как в исходнике: фланцы 10 мм, косынка 6 мм). */
const SHAPE_DEFAULT_THICKNESS: Record<CuttingShape, number> = { square: 10, circle: 10, triangle: 6, other: 2 };

/** Поля с размерами, релевантные каждой фигуре: подписи параметров X/Y. */
const SHAPE_DIMENSIONS: Record<CuttingShape, { x?: string; y?: string }> = {
  square: { x: typo("Ширина, мм"), y: typo("Высота, мм") },
  circle: { x: typo("Диаметр, мм") },
  triangle: { x: typo("Катет 1, мм"), y: typo("Катет 2, мм") },
  other: {},
};

export const CuttingCalculator = ({
  categoryId,
  priceRows,
  defaultMetalPricePerTon,
  scrapPricePerKg,
}: CuttingCalculatorProps) => {
  const [items, setItems] = useState<CuttingCalcItem[]>([]);
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const thicknessOptions: SelectFieldOption[] = priceRows.map((row) => ({
    value: String(row.thickness),
    label: typo(`${row.thickness} мм`),
  }));

  const form = useForm({
    defaultValues: {
      shape: "square" as CuttingShape,
      xMm: "",
      yMm: "",
      cutLengthM: "",
      holesAmount: "",
      amount: "1",
      thicknessMm: String(priceRows[0]?.thickness ?? 2),
      metalPricePerTon: String(defaultMetalPricePerTon),
      withHoles: false,
      boltDiameterMm: "",
      boltAmount: "",
      innerHoleDiameterMm: "",
    },
    onSubmit: ({ value }) => {
      const shape = value.shape;
      const amount = Math.max(1, Math.round(parsePositiveDecimal(value.amount)));
      const thicknessMm = parsePositiveDecimal(value.thicknessMm);
      const metalPricePerTon = parsePositiveDecimal(value.metalPricePerTon);

      const problems: string[] = [];
      if (shape !== "other") {
        if (parsePositiveDecimal(value.xMm) === 0) problems.push(SHAPE_DIMENSIONS[shape].x ?? "X");
        if (SHAPE_DIMENSIONS[shape].y && parsePositiveDecimal(value.yMm) === 0) problems.push(SHAPE_DIMENSIONS[shape].y);
        if (metalPricePerTon === 0) problems.push(typo("Цена металла"));
      } else {
        if (parsePositiveDecimal(value.cutLengthM) === 0) problems.push(typo("Длина реза"));
      }
      if (problems.length > 0) {
        toast.error(typo(`Заполните поля: ${problems.join(", ")}`));
        return;
      }

      // Геометрия: отверстия должны помещаться в деталь
      if (value.withHoles && (shape === "square" || shape === "circle")) {
        const xMm = parsePositiveDecimal(value.xMm);
        const yMm = shape === "square" ? parsePositiveDecimal(value.yMm) : xMm;
        const limit = Math.min(xMm, yMm);
        const bolt = parsePositiveDecimal(value.boltDiameterMm);
        const inner = parsePositiveDecimal(value.innerHoleDiameterMm);
        if (bolt >= limit || inner >= limit) {
          toast.error(typo("Диаметр отверстий должен быть меньше размеров детали"));
          return;
        }
      }

      const item = calculateCutting(
        {
          shape,
          amount,
          thicknessMm,
          metalPricePerTon,
          xMm: parsePositiveDecimal(value.xMm),
          yMm: parsePositiveDecimal(value.yMm),
          cutLengthM: parsePositiveDecimal(value.cutLengthM),
          holesAmount: Math.round(parsePositiveDecimal(value.holesAmount)),
          boltDiameterMm: value.withHoles ? parsePositiveDecimal(value.boltDiameterMm) : 0,
          boltAmount: value.withHoles ? Math.round(parsePositiveDecimal(value.boltAmount)) : 0,
          innerHoleDiameterMm: value.withHoles ? parsePositiveDecimal(value.innerHoleDiameterMm) : 0,
        },
        priceRows,
        scrapPricePerKg,
      );

      if (!item) {
        toast.error(typo("Не удалось рассчитать: нет подходящей строки прайса"));
        return;
      }

      setItems((prev) => [...prev, item]);
    },
  });

  const removeItem = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));

  const total = calcItemsTotal(items);

  return (
    <VStack gap="lg">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>
              <Heading variant="h3">{typo("Калькулятор плазменной резки")}</Heading>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VStack gap="md">
              <form.Field name="shape">
                {(field: AnyFieldApi) => (
                  <VStack gap="sm">
                    <Label>{typo("Тип изделия")}</Label>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {(Object.keys(CUTTING_SHAPES) as CuttingShape[]).map((shape) => {
                        const isSelected = (field.state.value as CuttingShape) === shape;
                        return (
                          <button
                            type="button"
                            key={shape}
                            onClick={() => {
                              field.handleChange(shape);
                              const preferred = SHAPE_DEFAULT_THICKNESS[shape];
                              const row =
                                priceRows.find((candidate) => candidate.thickness >= preferred) ??
                                priceRows[priceRows.length - 1];
                              if (row) form.setFieldValue("thicknessMm", String(row.thickness));
                            }}
                            className={cn(
                              "overflow-hidden rounded-xl border text-left transition-colors",
                              isSelected ? "border-primary ring-primary ring-1" : "hover:border-primary/60",
                            )}
                          >
                            <div className="relative aspect-3/2 w-full overflow-hidden bg-white">
                              <Image
                                src={SHAPE_IMAGES[shape]}
                                alt={CUTTING_SHAPES[shape]}
                                fill
                                sizes="(max-width: 768px) 50vw, 220px"
                                className="object-cover"
                              />
                            </div>
                            <div className={cn("px-3 py-2 text-sm font-medium", isSelected && "text-primary")}>
                              {CUTTING_SHAPES[shape]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </VStack>
                )}
              </form.Field>

              <form.Subscribe
                selector={(state) => state.values.shape}
                children={(shapeValue) => {
                  const shape = shapeValue;
                  return (
                  <VStack gap="md">
                    {SHAPE_DIMENSIONS[shape].x ? (
                      <form.Field name="xMm">
                        {(field: AnyFieldApi) => (
                          <NumberField fieldApi={field} field={{ label: SHAPE_DIMENSIONS[shape].x ?? "" }} />
                        )}
                      </form.Field>
                    ) : null}
                    {SHAPE_DIMENSIONS[shape].y ? (
                      <form.Field name="yMm">
                        {(field: AnyFieldApi) => (
                          <NumberField fieldApi={field} field={{ label: SHAPE_DIMENSIONS[shape].y ?? "" }} />
                        )}
                      </form.Field>
                    ) : null}
                    {shape === "other" ? (
                      <>
                        <form.Field name="cutLengthM">
                          {(field: AnyFieldApi) => (
                            <NumberField fieldApi={field} field={{ label: typo("Длина реза, пог. м") }} />
                          )}
                        </form.Field>
                        <form.Field name="holesAmount">
                          {(field: AnyFieldApi) => (
                            <NumberField fieldApi={field} field={{ label: typo("Количество врезок, шт") }} />
                          )}
                        </form.Field>
                      </>
                    ) : null}

                    <form.Field name="thicknessMm">
                      {(field: AnyFieldApi) => (
                        <SelectField
                          fieldApi={field}
                          field={{ label: typo("Толщина металла"), inputProps: { options: thicknessOptions } }}
                        />
                      )}
                    </form.Field>

                    <form.Field name="amount">
                      {(field: AnyFieldApi) => <NumberField fieldApi={field} field={{ label: typo("Количество, шт") }} />}
                    </form.Field>

                    {shape !== "other" ? (
                      <form.Field name="metalPricePerTon">
                        {(field: AnyFieldApi) => (
                          <NumberField fieldApi={field} field={{ label: typo("Цена металла, руб/т") }} />
                        )}
                      </form.Field>
                    ) : null}

                    {shape === "square" || shape === "circle" ? (
                      <>
                        <form.Field name="withHoles">
                          {(field: AnyFieldApi) => (
                            <SwitchField fieldApi={field} field={{ label: typo("Отверстия под болты / внутреннее") }} />
                          )}
                        </form.Field>
                        <form.Subscribe
                          selector={(state) => state.values.withHoles}
                          children={(withHoles) =>
                            Boolean(withHoles) ? (
                              <VStack gap="md">
                                <form.Field name="boltDiameterMm">
                                  {(field: AnyFieldApi) => (
                                    <NumberField fieldApi={field} field={{ label: typo("Диаметр отверстий под болты, мм") }} />
                                  )}
                                </form.Field>
                                <form.Field name="boltAmount">
                                  {(field: AnyFieldApi) => (
                                    <NumberField fieldApi={field} field={{ label: typo("Количество отверстий под болты, шт") }} />
                                  )}
                                </form.Field>
                                <form.Field name="innerHoleDiameterMm">
                                  {(field: AnyFieldApi) => (
                                    <NumberField
                                      fieldApi={field}
                                      field={{ label: typo("Диаметр внутреннего отверстия, мм") }}
                                    />
                                  )}
                                </form.Field>
                              </VStack>
                            ) : null
                          }
                        />
                      </>
                    ) : null}
                  </VStack>
                  );
                }}
              />
            </VStack>
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" className="w-full">
              {typo("Рассчитать и добавить в список")}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {items.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              <Heading variant="h3">{typo("Ваш расчёт")}</Heading>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VStack gap="sm">
              {items.map((item) => (
                <HStack key={item.id} gap="md" align="center" justify="between" className="rounded-xl border p-4">
                  <VStack className="min-w-0 gap-0.5">
                    <span className="font-medium">
                      {item.shapeLabel} — {item.sizes}
                    </span>
                    <Text variant="small" color="supplementary">
                      {typo(
                        `${item.amount} шт. × ${formatRub(item.pricePerUnit)}${item.weightKg !== null ? ` · ${item.weightKg} кг/шт` : ""}`,
                      )}
                    </Text>
                  </VStack>
                  <HStack gap="md" align="center" className="shrink-0">
                    <span className="font-semibold whitespace-nowrap">{formatRub(item.totalPrice)}</span>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <HStack justify="between" align="center">
              <Text variant="large">{typo("Итого")}</Text>
              <Heading variant="h3">{formatRub(total)}</Heading>
            </HStack>
            <Button size="lg" onClick={() => setIsRequestOpen(true)}>
              {typo("Отправить заявку с расчётом")}
            </Button>
            <Text variant="small" color="supplementary">
              {typo("Расчёт предварительный; точную стоимость подтвердит менеджер после проверки чертежей.")}
            </Text>
          </CardFooter>
        </Card>
      ) : null}

      <RequestFormDialog
        open={isRequestOpen}
        onOpenChange={setIsRequestOpen}
        categoryId={categoryId}
        calcItems={items}
        onSuccess={() => {
          setIsRequestOpen(false);
          setItems([]);
        }}
      />
    </VStack>
  );
};
