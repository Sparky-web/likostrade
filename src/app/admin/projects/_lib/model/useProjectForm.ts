"use client";

import { useForm } from "@tanstack/react-form";
import { isoDateStringSchema, translit, typo } from "lib";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { useProjectById } from "../api/useProjectById";

type UseProjectFormParams = {
  selectedId: string | undefined;
  isCreation: boolean;
  onCreated: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
};

export const useProjectForm = ({
  selectedId,
  isCreation,
  onCreated,
  onUpdated,
  onDeleted,
}: UseProjectFormParams) => {
  const { data, isPending, refetch } = useProjectById(selectedId);

  const { mutateAsync: update } = api.projects.update.useMutation();
  const { mutateAsync: create } = api.projects.create.useMutation();

  const deleteMutation = api.projects.delete.useMutation({
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
    return {
      title: data.title,
      shortDescription: data.shortDescription ?? "",
      dateCompleted: data.dateCompleted,
      price: data.price ?? "",
      timeToComplete: data.timeToComplete ?? "",
      task: data.task ?? "",
      workProgress: data.workProgress ?? "",
      result: data.result ?? "",
      mainImageId: data.mainImageId,
      additionalImages: data.additionalImages.map((image) => image.id),
      categories: data.categories.map((category) => category.id),
      isHidden: data.isHidden,
    };
  }, [data]);

  const form = useForm({
    defaultValues: mappedData
      ? mappedData
      : {
          title: "",
          shortDescription: "",
          dateCompleted: "",
          price: "",
          timeToComplete: "",
          task: "",
          workProgress: "",
          result: "",
          mainImageId: null satisfies null | string as null | string,
          additionalImages: [] satisfies string[] as string[],
          categories: [] satisfies string[] as string[],
          isHidden: false,
        },

    onSubmit: async ({ value: values }) => {
      try {
        const payload = {
          ...values,
          shortDescription: values.shortDescription || null,
          price: values.price || null,
          timeToComplete: values.timeToComplete || null,
          task: values.task || null,
          workProgress: values.workProgress || null,
          result: values.result || null,
        };

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
    dateValidator: isoDateStringSchema,
  };
};
