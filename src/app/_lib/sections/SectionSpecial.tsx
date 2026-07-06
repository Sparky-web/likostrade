import type { CategoryChildrenMode } from "generated/prisma";
import { exhaustiveCheck } from "lib";

import type { SpecialSection } from "~/sections/schema";

import type { SubcategoryCardItem } from "../components/SubcategoryCards";
import { SubcategoryCards } from "../components/SubcategoryCards";
import { CuttingCalculatorBlock } from "./CuttingCalculatorBlock";
import { CuttingPriceTableBlock } from "./CuttingPriceTableBlock";
import { RequestQuoteBlock } from "./RequestQuoteBlock";
import { SectionHeading } from "./SectionHeading";

/** Контекст категории для спец-блоков: данные им отдаёт страница, настройки у блоков отсутствуют. */
export type SpecialBlockContext = {
  categoryId: string;
  subcategories: SubcategoryCardItem[];
  /** Режим подкатегорий страницы — задаёт вид списка в блоке «Список подкатегорий». */
  childrenMode: CategoryChildrenMode;
};

export const SectionSpecial = ({ section, context }: { section: SpecialSection; context: SpecialBlockContext }) => {
  switch (section.block) {
    case "requestQuote":
      return (
        <section>
          <SectionHeading title={section.title} />
          <RequestQuoteBlock categoryId={context.categoryId} />
        </section>
      );
    case "subcategoryList":
      return (
        <section>
          <SectionHeading title={section.title} />
          <SubcategoryCards
            categories={context.subcategories}
            variant={context.childrenMode === "LIST" ? "list" : "cards"}
          />
        </section>
      );
    case "cuttingCalculator":
      return (
        <section>
          <SectionHeading title={section.title} />
          <CuttingCalculatorBlock categoryId={context.categoryId} />
        </section>
      );
    case "cuttingPriceTable":
      return (
        <section>
          <SectionHeading title={section.title} />
          <CuttingPriceTableBlock />
        </section>
      );
    default:
      return exhaustiveCheck(section.block);
  }
};
