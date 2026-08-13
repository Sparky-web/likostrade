import { formatPhoneNumber, typo } from "lib";

import { Button, Heading, HStack, Link, MaxIcon, TelegramIcon, VStack, WhatsAppIcon } from "~/components";
import { websiteConstants } from "~/consts";

import { EmailCopy } from "./EmailCopy";

type ContactsShortProps = {
  showCityPhone?: boolean;
};

export const ContactsShort = ({ showCityPhone = false }: ContactsShortProps) => {
  return (
    <VStack gap="lg">
      <VStack gap="sm">
        <Link href={`tel:+${websiteConstants.PHONE_DIGITS}`}>
          <Heading variant="h3">{typo(formatPhoneNumber(websiteConstants.PHONE_DIGITS))}</Heading>
        </Link>

        {showCityPhone ? (
          <Link href={`tel:+${websiteConstants.CITY_PHONE_DIGITS}`}>
            <Heading variant="h3">{typo(formatPhoneNumber(websiteConstants.CITY_PHONE_DIGITS))}</Heading>
          </Link>
        ) : null}

        <EmailCopy
          email={websiteConstants.EMAIL}
          emailClassName="text-(length:--paragraph-regular-font-size) leading-(--paragraph-regular-line-height) tracking-(--paragraph-regular-letter-spacing)"
        />
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
        <Link href={websiteConstants.MAX_URL} target="_blank">
          <Button variant="secondary" size="icon-lg">
            <MaxIcon className="size-7" />
          </Button>
        </Link>
      </HStack>
    </VStack>
  );
};
