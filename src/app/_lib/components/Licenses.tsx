import { typo } from "lib";

import { Carousel, ClickableImage, Container, Heading, VStack } from "~/components";

import first from "../lib/certificates/1.jpg";
import second from "../lib/certificates/2.jpg";
import third from "../lib/certificates/3.jpg";

export const Licenses = () => {
  return (
    <Container>
      <VStack gap="section">
        <Heading variant="h2">{typo(`Лицензии, сертификаты и благодарственные письма`)}</Heading>
        <Carousel
          mobileWidth={280}
          slidesAmount={{ md: 2, lg: 3 }}
          slides={[
            <ClickableImage key="1" src={first} alt="Document" className="aspect-3/4 rounded-xl md:mx-2" />,
            <ClickableImage key="2" src={second} alt="Document" className="aspect-3/4 rounded-xl md:mx-2" />,
            <ClickableImage key="3" src={third} alt="Document" className="aspect-3/4 rounded-xl md:mx-2" />,
          ]}
        />
      </VStack>
    </Container>
  );
};
