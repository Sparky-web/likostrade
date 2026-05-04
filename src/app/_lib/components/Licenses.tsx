import { typo } from "lib";

import { Carousel, ClickableImage, Container, Heading, VStack } from "~/components";

import document from "../lib/document.jpg";

export const Licenses = () => {
  return (
    <Container>
      <VStack gap="section">
        <Heading variant="h2">{typo(`Лицензии, сертификаты и благодарственные письма`)}</Heading>
        <Carousel
          mobileWidth={280}
          slidesAmount={{ md: 2, lg: 3 }}
          slides={[
            <ClickableImage key="1" src={document} alt="Document" className="rounded-xl md:mx-2" />,
            <ClickableImage key="2" src={document} alt="Document" className="rounded-xl md:mx-2" />,
            <ClickableImage key="3" src={document} alt="Document" className="rounded-xl md:mx-2" />,
          ]}
        />
      </VStack>
    </Container>
  );
};
