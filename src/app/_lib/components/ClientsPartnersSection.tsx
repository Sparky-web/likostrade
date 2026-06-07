import { typo } from "lib";
import type { StaticImageData } from "next/image";
import Image from "next/image";

import { Container, Heading, Text, VStack } from "~/components";

import { PARTNER_LOGOS } from "../lib/partners";

const CLIENTS_PARTNERS_INTRO = typo(
  `С 2007 года компания работает на рынке Урала, выполняя полный комплекс работ по проектированию, изготовлению и монтажу металлоконструкций. Производственные 
  мощности площадью 2000 м² позволяют выпускать более 100 тонн конструкций в месяц. За 19 лет работы успешно реализовано свыше 230 объектов «под ключ», что 
  подтверждает наш опыт, надежность и устойчивую репутацию на рынке.`,
);

function PartnerLogoImage({ src, alt }: { src: StaticImageData; alt: string }) {
  return (
    <div className="relative h-full w-full max-w-[200px]">
      <Image src={src} alt={alt} fill className="object-contain" sizes="200px" />
    </div>
  );
}

export function ClientsPartnersSection() {
  return (
    <Container>
      <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
        <VStack gap="xl" align="center">
          <Heading variant="h2">{typo(`Наши клиенты и партнеры`)}</Heading>
          <Text variant="large">{CLIENTS_PARTNERS_INTRO}</Text>
        </VStack>

        <div className="bg-foreground/80 overflow-hidden rounded-3xl">
          <div className="grid grid-cols-3 gap-px">
            {PARTNER_LOGOS.map((partner) => (
              <div key={partner.alt} className="bg-foreground flex min-h-[140px] items-center justify-center p-4">
                <PartnerLogoImage src={partner.src} alt={partner.alt} />
              </div>
            ))}
            <div className="bg-foreground text-background flex min-h-[140px] flex-col items-center justify-center text-center">
              <Heading variant="h3" align="center">
                200+
              </Heading>
              <Text align="center">{typo(`клиентов`)}</Text>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
