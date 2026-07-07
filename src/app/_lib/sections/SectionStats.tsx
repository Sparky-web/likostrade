import { typo } from "lib";

import { Heading, Text, VStack } from "~/components";
import type { StatsSection } from "~/sections/schema";

import { SectionHeading } from "./SectionHeading";

/** Лента показателей: крупные значения с подписями (тоннаж, точность, сроки). */
export const SectionStats = ({ section }: { section: StatsSection }) => (
  <section>
    <SectionHeading title={section.title} />
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
      {section.items.map((item, index) => (
        <VStack key={index} gap="2xs">
          <Heading variant="h2" renderAs="p">
            {typo(item.value)}
          </Heading>
          {item.label ? (
            <Text variant="small" color="supplementary">
              {typo(item.label)}
            </Text>
          ) : null}
        </VStack>
      ))}
    </div>
  </section>
);
