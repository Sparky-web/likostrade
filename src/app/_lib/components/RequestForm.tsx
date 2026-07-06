"use client";

import { formatPhoneNumber, typo } from "lib";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { type ReactNode } from "react";

import { AdaptiveGrid, Container, Heading, HStack, Link, Text, VStack } from "~/components";
import { websiteConstants } from "~/consts";

import { getContactAvailability } from "../lib/contactAvailability";
import requestFormImage from "../lib/requestForm.jpg";
import { REQUEST_FORM_SECTION_ID } from "../lib/requestFormSectionId";
import { EmailCopy } from "./EmailCopy";
import { RequestFormCard } from "./RequestFormCard";

type RequestFormProps = {
  categoryId?: string;
  projectId?: string;
};

type ContactRowProps = {
  icon: ReactNode;
  href?: string;
  primary: string;
  /** Кастомное содержимое вместо ссылки/текста (например, email с кнопкой копирования). */
  primaryNode?: ReactNode;
  secondary: string;
  isOnline?: boolean;
};

const ContactRow = ({ icon, href, primary, primaryNode, secondary, isOnline = false }: ContactRowProps) => {
  return (
    <HStack gap="md" align="start">
      <VStack className="bg-secondary size-12 min-w-12 rounded-lg" align="center" justify="center">
        {icon}
      </VStack>
      <VStack className="gap-1">
        {primaryNode ?? (href ? <Link href={href}>{primary}</Link> : <Text>{primary}</Text>)}
        <HStack gap="xs" align="center">
          {isOnline ? (
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-green-500" />
            </span>
          ) : undefined}
          <Text variant="small">{secondary}</Text>
        </HStack>
      </VStack>
    </HStack>
  );
};

export const RequestForm = ({ categoryId, projectId }: RequestFormProps) => {
  const contactAvailability = getContactAvailability();

  return (
    <div id={REQUEST_FORM_SECTION_ID} className="py-section relative scroll-mt-20">
      <Container>
        <Image src={requestFormImage} alt="Request Form" fill className="object-cover" />
        <div className="bg-background/80 absolute top-0 left-0 z-2 h-full w-full"></div>

        <AdaptiveGrid cols={{ base: 1, md: 2 }} gap="xl" className="relative z-3">
          <RequestFormCard categoryId={categoryId} projectId={projectId} inverted />
          <VStack gap="3xl">
            <VStack gap="2xl">
              <Heading variant="h3">{typo(`Контактная информация`)}</Heading>
              <VStack gap="lg">
                <ContactRow
                  icon={<Phone className="size-5" aria-hidden />}
                  href={`tel:+${websiteConstants.PHONE_DIGITS}`}
                  primary={typo(formatPhoneNumber(websiteConstants.PHONE_DIGITS))}
                  secondary={typo(contactAvailability.phoneSecondary)}
                  isOnline={contactAvailability.isPhoneOnline}
                />
                <ContactRow
                  icon={<Mail className="size-5" aria-hidden />}
                  primary={websiteConstants.EMAIL}
                  primaryNode={<EmailCopy email={websiteConstants.EMAIL} />}
                  secondary={typo(contactAvailability.emailSecondary)}
                />
                <ContactRow
                  icon={<MapPin className="size-5" aria-hidden />}
                  primary={websiteConstants.ADDRESS}
                  secondary={typo(`главный производственный цех`)}
                />
              </VStack>
            </VStack>
            <Text variant="large">
              {typo(
                `Мы готовы выполнить работу по вашим требованиям, гарантируя высокое качество и профессиональный подход в каждом заказе.`,
              )}
            </Text>
          </VStack>
        </AdaptiveGrid>
      </Container>
    </div>
  );
};
