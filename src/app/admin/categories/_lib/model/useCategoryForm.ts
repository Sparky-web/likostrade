"use client";

import { useForm } from "@tanstack/react-form";
import { translit, typo } from "lib";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import type { CategorySection } from "~/sections/schema";
import { normalizeSectionsForSave, parseSections } from "~/sections/schema";
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

//test

export const useCategoryForm = ({ selectedId, isCreation, onCreated, onUpdated, onDeleted }: UseCategoryFormParams) => {
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
      imageId: data.imageId,
      isHidden: data.isHidden,
      headerMode: data.headerMode,
      childrenMode: data.childrenMode,
      catalogTitle: data.catalogTitle ?? "",
      sortOrder: data.sortOrder,
      sections: parseSections(data.sections),
      subcategories: data.subcategories.map((sub) => sub.id),
      showCompletedProjects: data.showCompletedProjects ?? true,
      showClientsPartners: data.showClientsPartners ?? true,
      showLicenses: data.showLicenses ?? true,
      showContacts: data.showContacts ?? true,
      showRequestForm: data.showRequestForm ?? true,
    };
  }, [data]);

  const form = useForm({
    defaultValues: mappedData
      ? mappedData
      : {
          title: "",
          landingTitle: "",
          shortDescription: "",
          imageId: null satisfies null | string,
          isHidden: false,
          headerMode: "HERO" as const,
          childrenMode: "TILES" as const,
          catalogTitle: "",
          sortOrder: 0,
          sections: [] satisfies CategorySection[] as CategorySection[],
          subcategories: [] satisfies string[] as string[],
          showCompletedProjects: true,
          showClientsPartners: true,
          showLicenses: true,
          showContacts: true,
          showRequestForm: true,
        },

    onSubmit: async ({ value: values }) => {
      // Редактор держит опциональные поля секций пустыми строками — схема сервера ждёт их отсутствие
      const payload = {
        ...values,
        sortOrder: Number(values.sortOrder) || 0,
        sections: normalizeSectionsForSave(values.sections),
      };
      try {
        if (isCreation) {
          await create({
            id: translit(values.title),
            ...payload,
          });

          onCreated();
        } else if (selectedId) {
          // id (слаг) при обновлении не меняется — сервер принимает только поля формы
          await update({
            id: selectedId,
            data: payload,
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
