import { cn } from "~/components";
import type { TextSection } from "~/sections/schema";

import { SectionHeading } from "./SectionHeading";

type SectionTextProps = {
  section: TextSection;
  /** Первая секция страницы без заголовка — вводный лид: крупнее и мягче, как подзаголовок под hero. */
  lead?: boolean;
};

export const SectionText = ({ section, lead = false }: SectionTextProps) => (
  <section>
    <SectionHeading title={section.title} />
    <div
      className={cn("rich-html-content", lead ? "max-w-4xl text-2xl leading-relaxed font-light" : "text-lg")}
      dangerouslySetInnerHTML={{ __html: section.html }}
    />
  </section>
);
