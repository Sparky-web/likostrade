import { typo } from "lib";
import type { StaticImageData } from "next/image";
import Image from "next/image";

import { Container, Heading, Text, VStack } from "~/components";

import { CLIENT_PARTNER_LOGOS, CLIENTS_PARTNERS_INTRO } from "../model/clientPartners";

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
            {CLIENT_PARTNER_LOGOS.map((partner) => (
              <div
                key={partner.alt}
                className="bg-foreground flex min-h-[140px] items-center justify-center p-4"
              >
                <PartnerLogoImage src={partner.src} alt={partner.alt} />
              </div>
            ))}
            <div className="bg-foreground text-background flex min-h-[140px] flex-col items-center justify-center text-center">
              <Heading variant="h3" align="center">
                200+
              </Heading>
              <Text align="center">{typo(`компаний`)}</Text>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
