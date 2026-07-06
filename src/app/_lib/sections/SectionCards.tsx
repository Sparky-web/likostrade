import { typo } from "lib";

import { AdaptiveGrid, Card, CardContent, Heading, Text, VStack } from "~/components";
import type { CardsSection } from "~/sections/schema";

import { cardIcons } from "./cardIcons";
import { SectionHeading } from "./SectionHeading";

export const SectionCards = ({ section }: { section: CardsSection }) => (
  <section>
    <SectionHeading title={section.title} />
    <AdaptiveGrid cols={{ base: 1, md: 2, xl: 3 }} gap="md">
      {section.items.map((item, index) => {
        const Icon = item.icon ? cardIcons[item.icon] : null;
        return (
          <Card key={index}>
            <CardContent>
              <VStack gap="md">
                {Icon ? (
                  <VStack className="bg-secondary size-12 min-w-12 rounded-lg" align="center" justify="center">
                    <Icon className="text-primary size-6" aria-hidden />
                  </VStack>
                ) : null}
                <VStack gap="xs">
                  <Heading variant="h4">{typo(item.title)}</Heading>
                  {item.text ? <Text color="supplementary">{typo(item.text)}</Text> : null}
                </VStack>
              </VStack>
            </CardContent>
          </Card>
        );
      })}
    </AdaptiveGrid>
  </section>
);
