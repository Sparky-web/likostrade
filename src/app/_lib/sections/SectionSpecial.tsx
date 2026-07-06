import { exhaustiveCheck } from "lib";

import type { SpecialSection } from "~/sections/schema";

import type { SubcategoryCardItem } from "../components/SubcategoryCards";
import { SubcategoryCards } from "../components/SubcategoryCards";
import { RequestQuoteBlock } from "./RequestQuoteBlock";
import { SectionHeading } from "./SectionHeading";

/** Контекст категории для спец-блоков: данные им отдаёт страница, настройки у блоков отсутствуют. */
export type SpecialBlockContext = {
  categoryId: string;
  subcategories: SubcategoryCardItem[];
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
          <SubcategoryCards categories={context.subcategories} />
        </section>
      );
    default:
      return exhaustiveCheck(section.block);
  }
};
