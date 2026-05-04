import { typo } from "lib";

import { Heading, HStack, Text } from "~/components";

type ProjectQuickInfoProps = {
  price: string | null;
  timeToComplete: string | null;
};

export const ProjectQuickInfo = ({ price, timeToComplete }: ProjectQuickInfoProps) => {
  if (!price && !timeToComplete) return null;

  return (
    <HStack gap="lg" align="center" className="flex-wrap">
      {price ? (
        <div className="bg-card rounded-2xl px-6 py-4">
          <Heading variant="h2">{typo(price)}</Heading>
        </div>
      ) : undefined}
      {timeToComplete ? (
        <Text variant="large" bold>
          {typo(timeToComplete)}
        </Text>
      ) : undefined}
    </HStack>
  );
};
