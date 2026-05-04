"use client";

import { useForm } from "@tanstack/react-form";
import { typo } from "lib";
import { zodRussian } from "lib/src/zodRussian";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import {
  AdaptiveGrid,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Container,
  type FormField,
  FormFields,
  Heading,
  HStack,
  Link,
  Text,
  VStack,
} from "~/components";

import requestFormImage from "../lib/requestForm.jpg";

type ContactRowProps = {
  icon: ReactNode;
  href?: string;
  primary: string;
  secondary: string;
};

const ContactRow = ({ icon, href, primary, secondary }: ContactRowProps) => {
  return (
    <HStack gap="md" align="start">
      <VStack className="bg-secondary size-12 rounded-lg" align="center" justify="center">
        {icon}
      </VStack>
      <VStack className="gap-1">
        {href ? <Link href={href}>{primary}</Link> : <Text>{primary}</Text>}
        <Text variant="small">{secondary}</Text>
      </VStack>
    </HStack>
  );
};

const fields: FormField[] = [
  {
    name: "name",
    label: typo(`Имя`),
    type: "text",
    validator: zodRussian.string().min(1),
  },
  {
    name: "email",
    label: typo(`Email`),
    placeholder: typo(`example@example.com`),
    type: "text",
    validator: zodRussian.string().email(),
  },
  {
    name: "message",
    label: typo(`Сообщение`),
    type: "textarea",
    validator: zodRussian.string().min(1),
  },
];

export const RequestForm = () => {
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  return (
    <div className="py-section relative">
      <Container>
        <Image src={requestFormImage} alt="Request Form" fill className="object-cover" />
        <div className="bg-background/80 absolute top-0 left-0 z-2 h-full w-full"></div>

        <AdaptiveGrid cols={{ base: 1, md: 2 }} gap="xl" className="relative z-3">
          <form
            onSubmit={(e) => {
              void form.handleSubmit();
              e.preventDefault();
            }}
          >
            <Card className="inverted">
              <CardHeader>
                <CardTitle>
                  <Heading variant="h3">{typo("Оставить заявку")}</Heading>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VStack gap="md">
                  <FormFields fields={fields} form={form} />
                </VStack>
              </CardContent>
              <CardFooter>
                <Button type="submit" size="lg" className="w-full" isLoading={true}>
                  {typo("Отправить")}
                </Button>
              </CardFooter>
            </Card>
          </form>
          <VStack gap="3xl">
            <VStack gap="2xl">
              <Heading variant="h3">{typo(`Контактная информация`)}</Heading>
              <VStack gap="lg">
                <ContactRow
                  icon={<Phone className="size-5" aria-hidden />}
                  href="tel:+79126871952"
                  primary={typo(`+7 912 687 19-52`)}
                  secondary={typo(`ответим завтра`)}
                />
                <ContactRow
                  icon={<Mail className="size-5" aria-hidden />}
                  href="mailto:babinovvlad@gmail.com"
                  primary={typo(`babinovvlad@gmail.com`)}
                  secondary={typo(`ответим в течение 24 часов`)}
                />
                <ContactRow
                  icon={<MapPin className="size-5" aria-hidden />}
                  primary={typo(`г. Екатеринбург. ул. Мартовская, дом 8`)}
                  secondary={typo(`главный производственный цех`)}
                />
              </VStack>
            </VStack>
            <Text variant="large">
              {typo(
                `Мы готовы выполнить лазерную резку по вашим требованиям, гарантируя высокое качество и профессиональный подход в каждом заказе.`,
              )}
            </Text>
          </VStack>
        </AdaptiveGrid>
      </Container>
    </div>
  );
};
