import { exhaustiveCheck } from "lib";
import { Fragment } from "react";

import { VStack } from "~/components";
import type { CategorySection } from "~/sections/schema";
import { parseSections } from "~/sections/schema";

import { SectionCards } from "./SectionCards";
import { SectionFiles } from "./SectionFiles";
import { SectionGallery } from "./SectionGallery";
import type { SpecialBlockContext } from "./SectionSpecial";
import { SectionSpecial } from "./SectionSpecial";
import { SectionTable } from "./SectionTable";
import { SectionText } from "./SectionText";
import { SectionVideo } from "./SectionVideo";

export type SectionsRendererProps = {
  /** Сырое значение Category.sections из БД; парсится толерантно (см. parseSections). */
  sections: unknown;
  /** Контекст для спец-блоков; без него special-секции не рендерятся. */
  context?: SpecialBlockContext;
};

function renderSection(section: CategorySection, context: SpecialBlockContext | undefined, isLead: boolean) {
  switch (section.type) {
    case "text":
      return <SectionText section={section} lead={isLead} />;
    case "table":
      return <SectionTable section={section} />;
    case "files":
      return <SectionFiles section={section} />;
    case "video":
      return <SectionVideo section={section} />;
    case "gallery":
      return <SectionGallery section={section} />;
    case "cards":
      return <SectionCards section={section} />;
    case "special":
      return context ? <SectionSpecial section={section} context={context} /> : null;
    default:
      return exhaustiveCheck(section);
  }
}

/** Секции контента страницы категории в заданном админкой порядке. */
export const SectionsRenderer = ({ sections, context }: SectionsRendererProps) => {
  const parsed = parseSections(sections);
  if (parsed.length === 0) return null;

  return (
    <VStack gap="section">
      {parsed.map((section, index) => (
        <Fragment key={section.id}>
          {renderSection(section, context, index === 0 && section.type === "text" && !section.title)}
        </Fragment>
      ))}
    </VStack>
  );
};
