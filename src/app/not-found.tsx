import { typo } from "lib";
import type { Metadata } from "next";

import { Button, Container, Heading, Link, Text, VStack } from "~/components";
import { websiteConstants } from "~/consts";

export const metadata: Metadata = {
  title: websiteConstants.NOT_FOUND_METADATA_TITLE,
  description: websiteConstants.NOT_FOUND_METADATA_DESCRIPTION,
};

export default function NotFound() {
  return (
    <Container className="py-section">
      <VStack gap="lg" justify="center" className="text-center">
        <Heading variant="h1">{typo("404")}</Heading>
        <Text variant="large">{websiteConstants.NOT_FOUND_METADATA_TITLE}</Text>
        <Text>{websiteConstants.NOT_FOUND_METADATA_DESCRIPTION}</Text>
        <Link href="/" className="max-w-fit">
          <Button size="lg">{typo("На главную")}</Button>
        </Link>
      </VStack>
    </Container>
  );
}
