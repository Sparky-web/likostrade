import { exhaustiveCheck } from "lib";
import { Fragment } from "react";

import { VStack } from "~/components";
import type { CategorySection } from "~/sections/schema";

import { SectionCallout } from "./SectionCallout";
import { SectionCards } from "./SectionCards";
import { SectionFiles } from "./SectionFiles";
import { SectionGallery } from "./SectionGallery";
import { SectionImageCards } from "./SectionImageCards";
import { SectionMediaText } from "./SectionMediaText";
import type { SpecialBlockContext } from "./SectionSpecial";
import { SectionSpecial } from "./SectionSpecial";
import { SectionStats } from "./SectionStats";
import { SectionSteps } from "./SectionSteps";
import { SectionTable } from "./SectionTable";
import { SectionText } from "./SectionText";
import { SectionVideo } from "./SectionVideo";

export type SectionsRendererProps = {
  /** Уже распарсенные секции (parseSections на вызывающей стороне — без двойного парсинга). */
  sections: CategorySection[];
  /** Контекст для спец-блоков; без него special-секции не рендерятся. */
  context?: SpecialBlockContext;
};

function renderSection(section: CategorySection, context: SpecialBlockContext | undefined) {
  switch (section.type) {
    case "text":
      return <SectionText section={section} />;
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
    case "imageCards":
      return <SectionImageCards section={section} />;
    case "mediaText":
      return <SectionMediaText section={section} />;
    case "steps":
      return <SectionSteps section={section} />;
    case "stats":
      return <SectionStats section={section} />;
    case "callout":
      return <SectionCallout section={section} />;
    case "special":
      return context ? <SectionSpecial section={section} context={context} /> : null;
    default:
      return exhaustiveCheck(section);
  }
}

/** Секции контента страницы категории в заданном админкой порядке. */
export const SectionsRenderer = ({ sections, context }: SectionsRendererProps) => {
  if (sections.length === 0) return null;

  return (
    <VStack gap="section">
      {sections.map((section) => (
        <Fragment key={section.id}>{renderSection(section, context)}</Fragment>
      ))}
    </VStack>
  );
};
