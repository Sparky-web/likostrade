import { typo } from "lib";

import { Text, VStack } from "~/components";
import type { CalloutSection } from "~/sections/schema";

import { SectionHeading } from "./SectionHeading";

/** Выделенная плашка: highlight — ключевое УТП/гарантия, quote — отзыв клиента с автором. */
export const SectionCallout = ({ section }: { section: CalloutSection }) => {
  const isQuote = section.variant === "quote";

  return (
    <section>
      <SectionHeading title={section.title} />
      <div className="border-primary bg-secondary rounded-xl border-l-4 p-6 md:p-8">
        <VStack gap="sm">
          <div className={isQuote ? "italic" : undefined}>
            <Text variant="large">{isQuote ? typo(`«${section.text}»`) : typo(section.text)}</Text>
          </div>
          {isQuote && section.author ? (
            <Text variant="small" color="supplementary">
              {typo(`— ${section.author}`)}
            </Text>
          ) : null}
        </VStack>
      </div>
    </section>
  );
};
