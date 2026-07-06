import { api } from "~/trpc/server";

import { CuttingCalculator } from "./CuttingCalculator";

/** Серверная обёртка калькулятора резки: отдаёт клиенту прайс и настройки. */
export const CuttingCalculatorBlock = async ({ categoryId }: { categoryId: string }) => {
  const { rows, metalPricePerTon, scrapPricePerKg } = await api.cutting.getPublic();
  if (rows.length === 0) return null;

  return (
    <CuttingCalculator
      categoryId={categoryId}
      priceRows={rows.map(({ thickness, pricePerMeter, piercePrice }) => ({ thickness, pricePerMeter, piercePrice }))}
      defaultMetalPricePerTon={metalPricePerTon}
      scrapPricePerKg={scrapPricePerKg}
    />
  );
};
