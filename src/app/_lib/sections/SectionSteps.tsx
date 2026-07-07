import { typo } from "lib";

import { Heading, HStack, Text, VStack } from "~/components";
import type { StepsSection } from "~/sections/schema";

import { SectionHeading } from "./SectionHeading";

/** Нумерованный процесс: вертикальная цепочка шагов с номерами — вместо маркированного списка. */
export const SectionSteps = ({ section }: { section: StepsSection }) => (
  <section>
    <SectionHeading title={section.title} />
    <VStack gap="lg">
      {section.items.map((item, index) => (
        <HStack key={index} gap="md" align="start">
          <VStack
            className="bg-secondary text-primary font-headings size-11 shrink-0 rounded-lg text-lg font-semibold"
            align="center"
            justify="center"
          >
            {index + 1}
          </VStack>
          <VStack gap="2xs" className="pt-1">
            <Heading variant="h4">{typo(item.title)}</Heading>
            {item.text ? <Text color="supplementary">{typo(item.text)}</Text> : null}
          </VStack>
        </HStack>
      ))}
    </VStack>
  </section>
);
