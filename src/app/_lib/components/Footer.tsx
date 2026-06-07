import { typo } from "lib";

import { AdaptiveGrid, Container, Heading, Link, Logo, Text, VStack } from "~/components";
import { websiteConstants } from "~/consts";
import { api } from "~/trpc/server";

import { ContactsShort } from "./ContactsShort";

export async function Footer() {
  const rootCategories = await api.categories.get({
    where: { parentCategories: { none: {} }, isHidden: false },
  });

  return (
    <Container className="py-section">
      <AdaptiveGrid cols={{ base: 1, md: 2, lg: 4 }} gap="3xl">
        <VStack gap="2xl">
          <Logo size="sm" />
          <Text>{typo(`${websiteConstants.COMPANY_NAME} ИНН: ${websiteConstants.INN}`)}</Text>
          <ContactsShort />
        </VStack>

        {rootCategories.map((category) => {
          const subcategories = category.subcategories.filter((subcategory) => !subcategory.isHidden);

          return (
            <VStack key={category.id} gap="2xl">
              <VStack className="lg:min-h-[45px]">
                <Link href={`/categories/${category.id}`}>
                  <Heading variant="h4" maxLines={2}>
                    {typo(category.title)}
                  </Heading>
                </Link>
              </VStack>
              {subcategories.length > 0 ? (
                <VStack gap="sm">
                  {subcategories.map((subcategory) => (
                    <Link key={subcategory.id} href={`/categories/${subcategory.id}`}>
                      {typo(subcategory.title)}
                    </Link>
                  ))}
                </VStack>
              ) : undefined}
            </VStack>
          );
        })}
      </AdaptiveGrid>
    </Container>
  );
}
