import { typo } from "lib";

import { AdaptiveGrid, Container, Heading, Link, Logo, Text, VStack } from "~/components";

import { ContactsShort } from "./ContactsShort";

export const Footer = () => {
  return (
    <Container className="py-section">
      <AdaptiveGrid cols={{ base: 1, md: 2, lg: 4 }} gap="3xl">
        <VStack gap="2xl">
          <Logo size="sm" />
          <Text>{typo(`ООО “Ликос” ИНН : 250303391777 Юридический адрес: г. Владивосток`)}</Text>
          <Link href="#">{typo(`Политика конфиденциальности`)}</Link>
        </VStack>

        <VStack gap="2xl">
          <Heading variant="h4">{typo("Услуги")}</Heading>
          <VStack gap="sm">
            <Link href="#">{typo("Лазерная резка и рубка металла")}</Link>
            <Link href="#">{typo("Плазменная резка труб и металла")}</Link>
            <Link href="#">{typo("Гибка")}</Link>
            <Link href="#">{typo("Вальцовка")}</Link>
            <Link href="#">{typo("Сварочные работы")}</Link>
          </VStack>
        </VStack>

        <VStack gap="2xl">
          <Heading variant="h4">{typo("Услуги")}</Heading>
          <VStack gap="sm">
            <Link href="#">{typo("Лазерная резка и рубка металла")}</Link>
            <Link href="#">{typo("Плазменная резка труб и металла")}</Link>
            <Link href="#">{typo("Гибка")}</Link>
            <Link href="#">{typo("Вальцовка")}</Link>
            <Link href="#">{typo("Сварочные работы")}</Link>
          </VStack>
        </VStack>

        <VStack gap="2xl">
          <Heading variant="h4">{typo("Контакты")}</Heading>
          <ContactsShort />
        </VStack>
      </AdaptiveGrid>
    </Container>
  );
};
