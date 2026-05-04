"use client";

import { useForm } from "@tanstack/react-form";
import { translit, typo } from "lib";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { useCategoryById } from "../api/useCategoryById";

type UseCategoryFormParams = {
  selectedId: string | undefined;
  isCreation: boolean;
  // Колбэки разделены, чтобы хук-модель не знала про UI-состояние сайд-панелей
  onCreated: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
};

export const useCategoryForm = ({
  selectedId,
  isCreation,
  onCreated,
  onUpdated,
  onDeleted,
}: UseCategoryFormParams) => {
  const { data, isPending, refetch } = useCategoryById(selectedId);

  const { mutateAsync: update } = api.categories.update.useMutation();
  const { mutateAsync: create } = api.categories.create.useMutation();

  const deleteMutation = api.categories.delete.useMutation({
    onSuccess: () => {
      toast.success(typo("Запись удалена"));
      onDeleted();
    },
    onError: (error) => {
      console.error(error);
      toast.error(typo("Не удалось удалить запись"));
    },
  });

  const mappedData = useMemo(() => {
    if (!data) return null;
    // Унифицируем nullable-поля в строки, чтобы тип формы был стабилен между fallback и редактированием
    return {
      title: data.title,
      landingTitle: data.landingTitle ?? "",
      shortDescription: data.shortDescription ?? "",
      htmlDescription: data.htmlDescription ?? "",
      imageId: data.imageId,
      isHidden: data.isHidden,
      subcategories: data.subcategories.map((sub) => sub.id),
    };
  }, [data]);

  const form = useForm({
    defaultValues: mappedData
      ? mappedData
      : {
          title: "",
          landingTitle: "",
          shortDescription: "",
          htmlDescription: "",
          imageId: null satisfies null | string,
          isHidden: false,
          subcategories: [] satisfies string[] as string[],
        },

    onSubmit: async ({ value: values }) => {
      try {
        if (isCreation) {
          await create({
            id: translit(values.title),
            ...values,
          });

          onCreated();
        } else if (selectedId) {
          await update({
            id: selectedId,
            data: {
              id: translit(values.title),
              ...values,
            },
          });
          onUpdated();
          void refetch();
        }

        toast.success(typo(`Успешно`));
      } catch (e) {
        console.error(e);
        toast.error(typo(`Произошла ошибка`));
      }
    },
  });

  const handleDelete = useCallback(() => {
    if (selectedId) deleteMutation.mutate({ id: selectedId });
  }, [deleteMutation, selectedId]);

  return {
    data,
    isPending,
    refetch,
    form,
    handleDelete,
    isDeleting: deleteMutation.isPending,
  };
};
