"use client";

import { useForm } from "@tanstack/react-form";
import { typo } from "lib";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { useFileById } from "../api/useFileById";

type UseFileFormParams = {
  selectedId: string | undefined;
  isCreation: boolean;
  onCreated: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
};

// Файлы создаются загрузкой через FileUploadField (он сам пишет запись в БД).
// Поэтому create-формы как у других сущностей нет: при create мы только подтягиваем
// загруженный id и обновляем alt; при update — меняем alt существующей записи.
export const useFileForm = ({ selectedId, isCreation, onCreated, onUpdated, onDeleted }: UseFileFormParams) => {
  const { data, isPending, refetch } = useFileById(selectedId);

  const { mutateAsync: update } = api.files.update.useMutation();

  const deleteMutation = api.files.delete.useMutation({
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
      image: data.id satisfies string as string | null,
      alt: data.alt ?? "",
    };
  }, [data]);

  const form = useForm({
    defaultValues: mappedData
      ? mappedData
      : {
          image: null satisfies null | string as null | string,
          alt: "",
        },

    onSubmit: async ({ value: values }) => {
      try {
        if (isCreation) {
          if (!values.image) {
            toast.error(typo("Сначала загрузите файл"));
            return;
          }
          await update({
            id: values.image,
            data: { alt: values.alt || null },
          });
          onCreated();
        } else if (selectedId) {
          await update({
            id: selectedId,
            data: { alt: values.alt || null },
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
