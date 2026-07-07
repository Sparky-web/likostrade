import { typo } from "lib";

import { ClickableImage, Heading, Text, VStack } from "~/components";
import type { ImageCardsSection } from "~/sections/schema";

import { SectionHeading } from "./SectionHeading";

/** Карточки с фото: сетка «изображение + заголовок + описание» — для типов продукции (чертежи, фото изделий). */
export const SectionImageCards = ({ section }: { section: ImageCardsSection }) => (
  <section>
    <SectionHeading title={section.title} />
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {section.items.map((item, index) => (
        <VStack key={index} gap="md" className="overflow-hidden rounded-xl border">
          <div className="relative aspect-[4/3] w-full bg-white">
            <ClickableImage
              src={`/uploads/${item.imageId}`}
              alt={typo(item.title)}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              imageClassName="object-contain p-3"
            />
          </div>
          <VStack gap="xs" className="px-5 pb-5">
            <Heading variant="h4">{typo(item.title)}</Heading>
            {item.text ? <Text color="supplementary">{typo(item.text)}</Text> : null}
          </VStack>
        </VStack>
      ))}
    </div>
  </section>
);
