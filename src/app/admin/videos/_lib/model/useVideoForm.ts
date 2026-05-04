"use client";

import { useForm } from "@tanstack/react-form";
import { translit, typo } from "lib";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { useVideoById } from "../api/useVideoById";

type UseVideoFormParams = {
  selectedId: string | undefined;
  isCreation: boolean;
  onCreated: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
};

export const useVideoForm = ({ selectedId, isCreation, onCreated, onUpdated, onDeleted }: UseVideoFormParams) => {
  const { data, isPending, refetch } = useVideoById(selectedId);

  const { mutateAsync: update } = api.videos.update.useMutation();
  const { mutateAsync: create } = api.videos.create.useMutation();

  const deleteMutation = api.videos.delete.useMutation({
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
      description: data.description ?? "",
      url: data.url,
      categoryId: data.categoryId ?? "",
    };
  }, [data]);

  const form = useForm({
    defaultValues: mappedData
      ? mappedData
      : {
          title: "",
          description: "",
          url: "",
          categoryId: "",
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
