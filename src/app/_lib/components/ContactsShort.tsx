import { formatPhoneNumber, typo } from "lib";

import { Button, Heading, HStack, Link, TelegramIcon, Text, VStack, WhatsAppIcon } from "~/components";
import { websiteConstants } from "~/consts";

export const ContactsShort = () => {
  return (
    <VStack gap="lg">
      <VStack gap="sm">
        <Link href={`tel:+${websiteConstants.PHONE_DIGITS}`}>
          <Heading variant="h3">
            {typo(formatPhoneNumber(websiteConstants.PHONE_DIGITS))}
          </Heading>
        </Link>

        <Link href={`mailto:${websiteConstants.EMAIL}`} variant="underline">
          <Text>{websiteConstants.EMAIL}</Text>
        </Link>
      </VStack>

      <HStack gap="xs" className="dark">
        <Link href={websiteConstants.WHATSAPP_URL} target="_blank">
          <Button variant="secondary" size="icon-lg">
            <WhatsAppIcon className="size-7" />
          </Button>
        </Link>
        <Link href={websiteConstants.TELEGRAM_URL} target="_blank">
          <Button variant="secondary" size="icon-lg">
            <TelegramIcon />
          </Button>
        </Link>
      </HStack>
    </VStack>
  );
};
