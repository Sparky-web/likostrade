import { typo } from "lib";

import { ClickableImage } from "~/components";
import type { MediaTextSection } from "~/sections/schema";

import { SectionHeading } from "./SectionHeading";

/** Текст + изображение в две колонки: разбивает длинное описание на «историю» с иллюстрацией. */
export const SectionMediaText = ({ section }: { section: MediaTextSection }) => {
  const imageLeft = section.imagePosition === "left";

  return (
    <section>
      <SectionHeading title={section.title} />
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10">
        <div className={imageLeft ? "md:order-1" : "md:order-2"}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border">
            <ClickableImage
              src={`/uploads/${section.imageId}`}
              alt={section.title ? typo(section.title) : ""}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              imageClassName="object-cover"
            />
          </div>
        </div>
        <div className={imageLeft ? "md:order-2" : "md:order-1"}>
          <div className="rich-html-content text-lg" dangerouslySetInnerHTML={{ __html: section.html }} />
        </div>
      </div>
    </section>
  );
};
