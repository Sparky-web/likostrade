"use client";

import { useForm } from "@tanstack/react-form";
import { typo } from "lib";
import { zodRussian } from "lib/src/zodRussian";
import { CircleCheckIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
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
  cn,
  type FormField,
  FormFields,
  Heading,
  VStack,
} from "~/components";
import type { CuttingCalcItem } from "~/cutting/calc";
import { api } from "~/trpc/react";

import { reachYandexMetrikaGoal, YANDEX_METRIKA_GOALS } from "../lib/yandexMetrika";

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

export type RequestFormCardProps = {
  categoryId?: string;
  projectId?: string;
  /** Позиции калькулятора резки — прикладываются к заявке. */
  calcItems?: CuttingCalcItem[];
  /** Тёмная карточка для светлого фона (как в блоке формы с фоновым фото). */
  inverted?: boolean;
  /** Вызывается после успешной отправки (например, чтобы закрыть модалку). */
  onSuccess?: () => void;
};

/** Карточка формы заявки с диалогом успеха — используется в блоке формы и в модалке «Запрос цены». */
export const RequestFormCard = ({ categoryId, projectId, calcItems, inverted = false, onSuccess }: RequestFormCardProps) => {
  const isProjectRequest = projectId !== undefined;
  const formFields = isProjectRequest ? baseFormFields : [...baseFormFields, attachmentsFormField];
  const formTitle = isProjectRequest ? typo("Заказать такой же или похожий") : typo("Оставить заявку");
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
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
          calcItems: calcItems && calcItems.length > 0 ? calcItems : undefined,
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

  const handleSuccessDialogChange = (open: boolean) => {
    setIsSuccessDialogOpen(open);
    if (!open) onSuccess?.();
  };

  return (
    <>
      <AlertDialog open={isSuccessDialogOpen} onOpenChange={handleSuccessDialogChange}>
        <AlertDialogContent className="justify-center justify-items-center text-center">
          <CircleCheckIcon className="size-12 text-green-600" />
          <AlertDialogTitle>{typo("Заявка отправлена")}</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {typo("Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время.")}
          </AlertDialogDescription>
          <AlertDialogAction className="w-full">{typo("Хорошо")}</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <Card className={cn(inverted && "inverted")}>
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
    </>
  );
};
