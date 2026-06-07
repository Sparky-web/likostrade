"use client";

import { useForm } from "@tanstack/react-form";
import { formatPhoneNumber, typo } from "lib";
import { zodRussian } from "lib/src/zodRussian";
import { CircleCheckIcon, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";

import {
  AdaptiveGrid,
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
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
import { websiteConstants } from "~/consts";
import { api } from "~/trpc/react";

import { getContactAvailability } from "../lib/contactAvailability";
import requestFormImage from "../lib/requestForm.jpg";
import { REQUEST_FORM_SECTION_ID } from "../lib/requestFormSectionId";
import { reachYandexMetrikaGoal, YANDEX_METRIKA_GOALS } from "../lib/yandexMetrika";

type RequestFormProps = {
  categoryId?: string;
  projectId?: string;
};

type ContactRowProps = {
  icon: ReactNode;
  href?: string;
  primary: string;
  secondary: string;
  isOnline?: boolean;
};

const ContactRow = ({ icon, href, primary, secondary, isOnline = false }: ContactRowProps) => {
  return (
    <HStack gap="md" align="start">
      <VStack className="bg-secondary size-12 min-w-12 rounded-lg" align="center" justify="center">
        {icon}
      </VStack>
      <VStack className="gap-1">
        {href ? <Link href={href}>{primary}</Link> : <Text>{primary}</Text>}
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

const baseFormFields: FormField[] = [
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
  },
];

const attachmentsFormField: FormField = {
  name: "files",
  label: typo(`Вложения`),
  type: "fileUpload",
  inputProps: {
    isMultiple: true,
    max: 5,
  },
};

export const RequestForm = ({ categoryId, projectId }: RequestFormProps) => {
  const isProjectRequest = projectId !== undefined;
  const formFields = isProjectRequest ? baseFormFields : [...baseFormFields, attachmentsFormField];
  const formTitle = isProjectRequest ? typo("Заказать такой же или похожий") : typo("Оставить заявку");
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const contactAvailability = getContactAvailability();
  const createLead = api.leads.create.useMutation();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
      files: [] satisfies string[] as string[],
    },
    onSubmit: async ({ value }) => {
      try {
        await createLead.mutateAsync({
          title: value.name,
          email: value.email,
          message: value.message,
          categoryId: categoryId ?? null,
          projectId: projectId ?? null,
          files: value.files.length > 0 ? value.files : undefined,
        });

        reachYandexMetrikaGoal(YANDEX_METRIKA_GOALS.requestSent);

        form.reset();
        setIsSuccessDialogOpen(true);
      } catch (error) {
        console.error(error);
        toast.error(typo("Не удалось отправить заявку"));
      }
    },
  });

  return (
    <>
      <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <AlertDialogContent className="justify-center justify-items-center text-center">
          <CircleCheckIcon className="size-12 text-green-600" />
          <AlertDialogTitle>{typo("Заявка отправлена")}</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {typo("Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время.")}
          </AlertDialogDescription>
          <AlertDialogAction className="w-full">{typo("Хорошо")}</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <div id={REQUEST_FORM_SECTION_ID} className="py-section relative scroll-mt-20">
        <Container>
          <Image src={requestFormImage} alt="Request Form" fill className="object-cover" />
          <div className="bg-background/80 absolute top-0 left-0 z-2 h-full w-full"></div>

          <AdaptiveGrid cols={{ base: 1, md: 2 }} gap="xl" className="relative z-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void form.handleSubmit();
              }}
            >
              <Card className="inverted">
                <CardHeader>
                  <CardTitle>
                    <Heading variant="h3">{formTitle}</Heading>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VStack gap="md">
                    <FormFields fields={formFields} form={form} />
                  </VStack>
                </CardContent>
                <CardFooter>
                  <Button type="submit" size="lg" className="w-full" isLoading={createLead.isPending}>
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
                    href={`tel:+${websiteConstants.PHONE_DIGITS}`}
                    primary={typo(formatPhoneNumber(websiteConstants.PHONE_DIGITS))}
                    secondary={typo(contactAvailability.phoneSecondary)}
                    isOnline={contactAvailability.isPhoneOnline}
                  />
                  <ContactRow
                    icon={<Mail className="size-5" aria-hidden />}
                    href={`mailto:${websiteConstants.EMAIL}`}
                    primary={websiteConstants.EMAIL}
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
    </>
  );
};
