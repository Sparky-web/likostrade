import { typo } from "lib";
import Image from "next/image";

import { AdaptiveGrid, Container, Heading, NumberParagraph, Text, VStack } from "~/components";

import aboutUs from "../lib/aboutUs.jpg";

export function AboutUs() {
  return (
    <Container>
      <VStack gap="section">
        <AdaptiveGrid cols={{ base: 1, md: 2 }} gap="lg">
          <VStack gap="xl">
            <Heading variant="h2">{typo(`О нас`)}</Heading>
            <VStack gap="lg">
              <Text variant="large">
                {typo(`Наш завод предлагает свои услуги по изготовлению, доставке, монтажу/демонтажу металлоконструкций.`)}
              </Text>
              <Text variant="large">
                {typo(
                  `Современная технологическая база производства, квалифицированный персонал, свои монтажные бригады – все это служит залогом качественного, оперативного изготовления, монтажа/демонтажа металлоконструкций и иных конструкций, необходимых для строительства объекта.`,
                )}
              </Text>
              <Text variant="large">
                {typo(
                  `Особое внимание на заводе уделяется качеству сварочных процессов, которые контролируются специалистами собственной лаборатории; технология сварки, оборудование и сварщики аттестованы по НАКС. Каждая отправочная марка проходит контроль специалистов ОТК, отгрузка происходит авто- и ж/д транспортом с учетом графика монтажа.`,
                )}
              </Text>
            </VStack>
          </VStack>
          <Image src={aboutUs} alt="About Us" className="w-full rounded-[36px]" />
        </AdaptiveGrid>
        <AdaptiveGrid cols={{ base: 1, md: 2, lg: 4 }} gap="lg" className="text-center md:text-left">
          <NumberParagraph number={typo(`200+ тонн`)} description={typo(`конструкций производится в месяц`)} />
          <NumberParagraph number={typo(`2000 м²`)} description={typo(`производственных площадей`)} />
          <NumberParagraph number={typo(`25 лет`)} description={typo(`проектируем и изготавливаем конструкции`)} />
          <NumberParagraph number={typo(`320 объектов`)} description={typo(`изготовлено и смонтировано «под ключ»`)} />
        </AdaptiveGrid>
      </VStack>
    </Container>
  );
}
