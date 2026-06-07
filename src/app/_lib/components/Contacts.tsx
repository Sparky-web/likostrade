"use client";
import { Card, CardContent, Container, Heading, Text, useAdaptive, VStack } from "~/components";
import { websiteConstants } from "~/consts";

import { ContactsShort } from "./ContactsShort";

export const Contacts = () => {
  const { isMobile } = useAdaptive();

  if (isMobile) {
    return (
      <Container>
        <VStack gap="xl">
          <iframe className="h-[400px] w-full rounded-md" src={websiteConstants.MAP_EMBED_URL} />
          <Card className="inverted rounded-md">
            <CardContent className="py-3 md:m-0 md:px-10">
              <VStack gap="xl">
                <Heading variant="h3">{websiteConstants.ADDRESS}</Heading>

                <Text variant="large">{websiteConstants.WORK_HOURS}</Text>

                <ContactsShort />
              </VStack>
            </CardContent>
          </Card>
        </VStack>
      </Container>
    );
  }

  return (
    <div className="relative">
      <iframe className="absolute top-0 left-0 h-full w-full" src={websiteConstants.MAP_EMBED_URL} />
      <div className="bg-background/10 pointer-events-none absolute top-0 left-0 h-full w-full backdrop-grayscale-100"></div>

      <Container className="py-section pointer-events-none relative z-2">
        <Card className="inverted pointer-events-auto max-w-lg rounded-md">
          <CardContent className="px-10 py-3">
            <VStack gap="xl">
              <Heading variant="h2">{websiteConstants.ADDRESS}</Heading>

              <Text variant="large">{websiteConstants.WORK_HOURS}</Text>

              <ContactsShort />
            </VStack>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};
