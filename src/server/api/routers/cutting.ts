import { zodRussian } from "lib";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const priceRowInput = zodRussian.object({
  thickness: zodRussian.number().positive(),
  pricePerMeter: zodRussian.number().nonnegative(),
  piercePrice: zodRussian.number().nonnegative(),
});

const savePricesInput = zodRussian.object({
  rows: zodRussian
    .array(priceRowInput)
    .min(1)
    .superRefine((rows, ctx) => {
      const seen = new Set<number>();
      for (const row of rows) {
        if (seen.has(row.thickness)) {
          ctx.addIssue({ code: "custom", message: `Толщина ${row.thickness} мм указана дважды` });
        }
        seen.add(row.thickness);
      }
    }),
  metalPricePerTon: zodRussian.number().positive(),
  scrapPricePerKg: zodRussian.number().nonnegative(),
});

/** Прайс плазменной резки и настройки калькулятора (металл, компенсация за обрезь). */
export const cuttingRouter = createTRPCRouter({
  getPublic: publicProcedure.query(async ({ ctx }) => {
    const [rows, settings] = await Promise.all([
      ctx.db.cuttingPriceRow.findMany({ orderBy: { thickness: "asc" } }),
      ctx.db.siteSettings.findUnique({ where: { id: "default" } }),
    ]);
    return {
      rows,
      metalPricePerTon: settings?.metalPricePerTon ?? 120000,
      scrapPricePerKg: settings?.scrapPricePerKg ?? 12,
    };
  }),

  save: protectedProcedure.input(savePricesInput).mutation(async ({ ctx, input }) => {
    // Полная замена прайса списком из формы — как везде в админке
    await ctx.db.$transaction([
      ctx.db.cuttingPriceRow.deleteMany(),
      ctx.db.cuttingPriceRow.createMany({ data: input.rows }),
      ctx.db.siteSettings.upsert({
        where: { id: "default" },
        create: {
          id: "default",
          metalPricePerTon: input.metalPricePerTon,
          scrapPricePerKg: input.scrapPricePerKg,
        },
        update: {
          metalPricePerTon: input.metalPricePerTon,
          scrapPricePerKg: input.scrapPricePerKg,
        },
      }),
    ]);
    return true;
  }),
});
