import { typo } from "lib";

import { ClickableImage, cn } from "~/components";
import type { GallerySection } from "~/sections/schema";

import { SectionHeading } from "./SectionHeading";

/**
 * Галерея фото: первое изображение крупное, остальные — миниатюры сеткой.
 * Товарные фото не обрезаются (object-contain на светлой подложке).
 */
export const SectionGallery = ({ section }: { section: GallerySection }) => {
  const [main, ...thumbnails] = section.items;
  if (!main) return null;

  return (
    <section>
      <SectionHeading title={section.title} />
      <div className="max-w-xl">
        <ClickableImage
          src={`/uploads/${main.fileId}`}
          alt={main.alt ? typo(main.alt) : typo("Фото 1")}
          width={800}
          height={600}
          className="bg-card aspect-4/3 w-full rounded-xl border"
          imageClassName="object-contain"
        />
        {thumbnails.length > 0 ? (
          <div className={cn("mt-3 grid grid-cols-4 gap-3")}>
            {thumbnails.map((item, index) => (
              <ClickableImage
                key={item.fileId}
                src={`/uploads/${item.fileId}`}
                alt={item.alt ? typo(item.alt) : typo(`Фото ${index + 2}`)}
                width={200}
                height={200}
                className="bg-card aspect-square rounded-lg border"
                imageClassName="object-contain"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};
