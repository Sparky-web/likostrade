import { exhaustiveCheck } from "lib";
import { Fragment } from "react";

import { VStack } from "~/components";
import type { CategorySection } from "~/sections/schema";
import { parseSections } from "~/sections/schema";

import { SectionCards } from "./SectionCards";
import { SectionFiles } from "./SectionFiles";
import { SectionTable } from "./SectionTable";
import { SectionText } from "./SectionText";
import { SectionVideo } from "./SectionVideo";

export type SectionsRendererProps = {
  /** Сырое значение Category.sections из БД; парсится толерантно (см. parseSections). */
  sections: unknown;
};

function renderSection(section: CategorySection) {
  switch (section.type) {
    case "text":
      return <SectionText section={section} />;
    case "table":
      return <SectionTable section={section} />;
    case "files":
      return <SectionFiles section={section} />;
    case "video":
      return <SectionVideo section={section} />;
    case "cards":
      return <SectionCards section={section} />;
    case "special":
      // Реестр спец-блоков подключается на этапе 4 (запрос цены, список подкатегорий)
      return null;
    default:
      return exhaustiveCheck(section);
  }
}

/** Секции контента страницы категории в заданном админкой порядке. */
export const SectionsRenderer = ({ sections }: SectionsRendererProps) => {
  const parsed = parseSections(sections);
  if (parsed.length === 0) return null;

  return (
    <VStack gap="section">
      {parsed.map((section) => (
        <Fragment key={section.id}>{renderSection(section)}</Fragment>
      ))}
    </VStack>
  );
};
