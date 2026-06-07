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
                {typo(
                  `ООО «Ликос» работает с 2007 года и сегодня развивает два ключевых направления: металлообработку и производство электрощитового оборудования. Мы выполняем 
  плазменную резку металла на станках с ЧПУ, изготавливаем детали любой сложности, элементы металлоконструкций, опоры трубопроводов, винтовые сваи, обсадные фильтры 
  и изделия художественной резки.`,
                )}
              </Text>
              <Text variant="large">
                {typo(
                  `Отдельным направлением является проектирование и сборка электрощитового 
  оборудования и шкафов автоматики по проектам и техническим заданиям заказчика. Мы производим ВРУ, ГРЩ, НКУ, АВР, шкафы управления и автоматизации, а также решения 
  для насосного, вентиляционного и котельного оборудования.`,
                )}
              </Text>
              <Text variant="large">
                {typo(
                  `За годы работы ООО «Ликос» реализовало проекты более чем для 200 клиентов на территории Урала. Основу 
  нашей работы составляют профессионализм, надежность, высокое качество исполнения и строгое соблюдение сроков.`,
                )}
              </Text>
            </VStack>
          </VStack>
          <Image src={aboutUs} alt="About Us" className="w-full rounded-[36px]" />
        </AdaptiveGrid>
        <AdaptiveGrid cols={{ base: 1, md: 2, lg: 4 }} gap="lg" className="text-center md:text-left">
          <NumberParagraph number={typo(`> 100 тонн`)} description={typo(`конструкций производится в месяц`)} />
          <NumberParagraph number={typo(`2000 м²`)} description={typo(`производственных площадей`)} />
          <NumberParagraph
            number={typo(`${new Date().getFullYear() - 2007} лет`)}
            description={typo(`проектируем и изготавливаем конструкции`)}
          />
          <NumberParagraph number={typo(`> 230 объектов`)} description={typo(`изготовлено и смонтировано «под ключ»`)} />
        </AdaptiveGrid>
      </VStack>
    </Container>
  );
}
