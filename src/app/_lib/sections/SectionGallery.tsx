import { typo } from "lib";

import { ClickableImage } from "~/components";
import type { GallerySection } from "~/sections/schema";

import { SectionHeading } from "./SectionHeading";

/**
 * Галерея фото: первое изображение крупное, остальные — миниатюры сеткой.
 * Товарные фото центрируются без обрезки и растяжения (object-contain
 * в карточке фиксированной высоты) — пропорции и ориентация любые.
 */
export const SectionGallery = ({ section }: { section: GallerySection }) => {
  const [main, ...thumbnails] = section.items;
  if (!main) return null;

  return (
    <section>
      <SectionHeading title={section.title} />
      <div className="max-w-xl">
        <div className="relative h-72 overflow-hidden rounded-xl border bg-white md:h-80">
          <ClickableImage
            src={`/uploads/${main.fileId}`}
            alt={main.alt ? typo(main.alt) : typo("Фото 1")}
            fill
            sizes="(max-width: 768px) 100vw, 576px"
            imageClassName="object-contain p-4"
          />
        </div>
        {thumbnails.length > 0 ? (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {thumbnails.map((item, index) => (
              <div key={item.fileId} className="relative aspect-square overflow-hidden rounded-lg border bg-white">
                <ClickableImage
                  src={`/uploads/${item.fileId}`}
                  alt={item.alt ? typo(item.alt) : typo(`Фото ${index + 2}`)}
                  fill
                  sizes="140px"
                  imageClassName="object-contain p-2"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};
