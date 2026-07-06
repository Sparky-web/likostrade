import { typo, zodRussian } from "lib";

/**
 * Расчёт стоимости плазменной резки. Формулы перенесены 1-в-1 со старого сайта
 * (likos-next/components/calculate/calculate.js), включая округления:
 * металл по весу заготовки + резка по прайсу (руб/м и руб/врезка) − компенсация за обрезь.
 *
 * Модуль чистый (без React) — используется клиентским калькулятором,
 * роутером заявок и карточкой заявки в админке.
 */

export const CUTTING_SHAPES = {
  square: typo("Фланец (прямоугольник)"),
  circle: typo("Фланец (круг)"),
  triangle: typo("Косынка"),
  other: typo("Произвольная резка"),
} as const;

export type CuttingShape = keyof typeof CUTTING_SHAPES;

const cuttingShapeKeys = Object.keys(CUTTING_SHAPES) as [CuttingShape, ...CuttingShape[]];

export type CuttingPriceRowData = {
  /** Толщина металла, мм. */
  thickness: number;
  /** Цена реза, руб/пог. м. */
  pricePerMeter: number;
  /** Цена врезки, руб/шт. */
  piercePrice: number;
};

export type CuttingCalcInput = {
  shape: CuttingShape;
  /** Количество изделий, шт. */
  amount: number;
  /** Толщина металла, мм. */
  thicknessMm: number;
  /** Цена металла, руб/т. */
  metalPricePerTon: number;
  /** square: ширина; circle: диаметр; triangle: катет 1 — мм. */
  xMm?: number;
  /** square: высота; triangle: катет 2 — мм. */
  yMm?: number;
  /** Диаметр отверстий под болты, мм (square и circle). */
  boltDiameterMm?: number;
  /** Количество отверстий под болты, шт. */
  boltAmount?: number;
  /** Диаметр внутреннего отверстия, мм (square и circle); 0 — нет. */
  innerHoleDiameterMm?: number;
  /** Произвольная резка: длина реза, пог. м. */
  cutLengthM?: number;
  /** Произвольная резка: количество врезок, шт. */
  holesAmount?: number;
};

/** Позиция расчёта — хранится в Lead.calcItems (jsonb). */
export const cuttingCalcItemSchema = zodRussian.object({
  id: zodRussian.string().min(1),
  shape: zodRussian.enum(cuttingShapeKeys),
  shapeLabel: zodRussian.string(),
  /** Человекочитаемые размеры («120 мм (диаметр) × 6 мм»). */
  sizes: zodRussian.string(),
  amount: zodRussian.number().int().positive(),
  thicknessMm: zodRussian.number().positive(),
  metalPricePerTon: zodRussian.number().nonnegative(),
  weightKg: zodRussian.number().nullable(),
  metalCost: zodRussian.number().nullable(),
  cuttingCostPerUnit: zodRussian.number(),
  pricePerUnit: zodRussian.number(),
  totalPrice: zodRussian.number(),
});

export const cuttingCalcItemsSchema = zodRussian.array(cuttingCalcItemSchema);

export type CuttingCalcItem = (typeof cuttingCalcItemSchema)["_output"];

/** Строка прайса для толщины: точное совпадение или ближайшая сверху; толще максимума — последняя. */
export function getPriceRowForThickness(
  rows: CuttingPriceRowData[],
  thicknessMm: number,
): CuttingPriceRowData | null {
  const sorted = [...rows].sort((a, b) => a.thickness - b.thickness);
  return sorted.find((row) => thicknessMm <= row.thickness) ?? sorted[sorted.length - 1] ?? null;
}

const DENSITY_KG_M3 = 7850;

export function calculateCutting(
  input: CuttingCalcInput,
  priceRows: CuttingPriceRowData[],
  scrapPricePerKg: number,
): CuttingCalcItem | null {
  const priceRow = getPriceRowForThickness(priceRows, input.thicknessMm);
  if (!priceRow) return null;

  const { pricePerMeter, piercePrice } = priceRow;

  // Перевод в метры и руб/кг — как в оригинале
  const x = (input.xMm ?? 0) * 0.001;
  const y = (input.yMm ?? 0) * 0.001;
  const innerHole = (input.innerHoleDiameterMm ?? 0) * 0.001;
  const thickness = input.thicknessMm * 0.001;
  const bolt = (input.boltDiameterMm ?? 0) * 0.001;
  const metalPricePerKg = input.metalPricePerTon * 0.001;
  const boltAmount = input.boltAmount ?? 0;

  const hasInnerHole = innerHole > 0;
  const innerHoleP = hasInnerHole ? innerHole * Math.PI : 0;
  const innerHoleS = hasInnerHole ? Math.PI * (innerHole / 2) ** 2 : 0;
  const boltsP = bolt * Math.PI * boltAmount;
  const boltsS = Math.PI * (bolt / 2) ** 2 * boltAmount;

  let weightKg: number | null = null;
  let metalCost: number | null = null;
  let cuttingCost = 0;
  let totalPerUnit = 0;
  let sizes = "";

  if (input.shape === "square") {
    const p = 2 * (x + y);
    const s = x * y;
    weightKg = s * thickness * DENSITY_KG_M3;
    metalCost = weightKg * metalPricePerKg;
    cuttingCost = (p + innerHoleP + boltsP) * pricePerMeter + (1 + boltAmount + (hasInnerHole ? 1 : 0)) * piercePrice;
    const scrapCredit = (boltsS + innerHoleS) * thickness * DENSITY_KG_M3 * scrapPricePerKg;
    totalPerUnit = metalCost + cuttingCost - scrapCredit;
    sizes = typo(`${input.xMm} × ${input.yMm} × ${input.thicknessMm} мм`);
  } else if (input.shape === "circle") {
    const s = Math.PI * (x / 2) ** 2;
    const p = Math.PI * x;
    weightKg = Math.round(s * thickness * DENSITY_KG_M3);
    // Металл считается по квадратной заготовке x², обрезь компенсируется скрап-ценой
    const blankWeight = x ** 2 * thickness * DENSITY_KG_M3;
    metalCost = Math.round(blankWeight * metalPricePerKg);
    const scrapCredit = (blankWeight - weightKg - (innerHoleS + boltsS) * thickness * DENSITY_KG_M3) * scrapPricePerKg;
    cuttingCost = Math.round(
      (p + innerHoleP + boltsP) * pricePerMeter + (1 + boltAmount + (hasInnerHole ? 1 : 0)) * piercePrice,
    );
    totalPerUnit = Math.round(metalCost + cuttingCost - scrapCredit);
    sizes = typo(`${input.xMm} мм (диаметр) × ${input.thicknessMm} мм`);
  } else if (input.shape === "triangle") {
    const p = x + y + Math.sqrt(x ** 2 + y ** 2);
    const s = (x * y) / 2;
    weightKg = s * thickness * DENSITY_KG_M3;
    metalCost = weightKg * metalPricePerKg;
    cuttingCost = p * pricePerMeter + piercePrice;
    totalPerUnit = metalCost + cuttingCost;
    sizes = typo(`катеты ${input.xMm} и ${input.yMm} мм, толщина ${input.thicknessMm} мм`);
  } else {
    cuttingCost = (input.cutLengthM ?? 0) * pricePerMeter + (input.holesAmount ?? 0) * piercePrice;
    totalPerUnit = cuttingCost;
    sizes = typo(`${input.cutLengthM ?? 0} пог. м, врезок: ${input.holesAmount ?? 0}, толщина ${input.thicknessMm} мм`);
  }

  return {
    id: crypto.randomUUID(),
    shape: input.shape,
    shapeLabel: CUTTING_SHAPES[input.shape],
    sizes,
    amount: input.amount,
    thicknessMm: input.thicknessMm,
    metalPricePerTon: input.metalPricePerTon,
    weightKg: weightKg === null ? null : Number(weightKg.toFixed(1)),
    metalCost: metalCost === null ? null : Math.round(metalCost),
    cuttingCostPerUnit: Math.round(cuttingCost),
    pricePerUnit: Math.round(totalPerUnit),
    totalPrice: Math.round(totalPerUnit * input.amount),
  };
}

const formatRub = (value: number) => `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;

/** Итог по списку позиций, ₽. */
export function calcItemsTotal(items: CuttingCalcItem[]): number {
  return items.reduce((sum, item) => sum + item.totalPrice, 0);
}

/** Блок текста о позициях расчёта для Telegram-уведомления о заявке. */
export function formatCalcItemsText(items: CuttingCalcItem[]): string {
  if (items.length === 0) return "";
  const lines = items.map((item, index) => {
    const parts = [
      typo(`${index + 1}. ${item.shapeLabel} — ${item.sizes}; ${item.amount} шт.`),
      item.weightKg !== null ? typo(`вес ${item.weightKg} кг/шт`) : null,
      typo(`резка ${formatRub(item.cuttingCostPerUnit)}/шт`),
      item.metalCost !== null ? typo(`металл ${formatRub(item.metalCost)}/шт`) : null,
      typo(`цена ${formatRub(item.pricePerUnit)}/шт, всего ${formatRub(item.totalPrice)}`),
    ];
    return parts.filter(Boolean).join("; ");
  });
  return [typo("Расчёт плазменной резки:"), ...lines, typo(`Итого по расчёту: ${formatRub(calcItemsTotal(items))}`)].join(
    "\n",
  );
}
