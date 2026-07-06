import type { TextSection } from "~/sections/schema";

import { SectionHeading } from "./SectionHeading";

export const SectionText = ({ section }: { section: TextSection }) => (
  <section>
    <SectionHeading title={section.title} />
    <div className="rich-html-content text-lg" dangerouslySetInnerHTML={{ __html: section.html }} />
  </section>
);
