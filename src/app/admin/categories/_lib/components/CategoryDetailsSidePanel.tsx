"use client";

import { typo } from "lib";
import { useMemo } from "react";

import { useCategoryOptions } from "~/app/admin/_lib";
import {
  CrudTableFormButton,
  CrudTableSidePanelDetailsButtons,
  FileUploadField,
  SelectMultipleField,
  SidePanel,
  Skeleton,
  SwitchField,
  TextareaField,
  TextField,
  useToggle,
  VStack,
} from "~/components";

import { useCategoryForm } from "../model/useCategoryForm";
import { CategoryDetails } from "./CategoryDetails";

// Дискриминируемое объединение: либо просмотр существующей записи, либо создание новой
export type CategoryDetailsSidePanelProps = {
  onClose: () => void;
} & (
  | {
      selectedId: string;
    }
  | {
      isCreation: true;
    }
);

export const CategoryDetailsSidePanel = (props: CategoryDetailsSidePanelProps) => {
  const { isToggled: isEditOpened, setTruthy: openEdit, setFalsy: closeEdit } = useToggle(false);

  const isCreation = "isCreation" in props;
  const selectedId = "selectedId" in props ? props.selectedId : undefined;

  const { data, isPending, refetch, form, handleDelete, isDeleting } = useCategoryForm({
    selectedId,
    isCreation,
    onCreated: props.onClose,
    onUpdated: closeEdit,
    onDeleted: props.onClose,
  });

  const subcategoryOptions = useCategoryOptions(selectedId);

  const handleCloseEdit = () => {
    void refetch();
    closeEdit();
  };

  const fields = useMemo(() => {
    return (
      <VStack gap="lg">
        <form.Field
          name="title"
          children={(field) => (
            <TextField
              fieldApi={field}
              field={{
                label: typo(`Название`),
              }}
            />
          )}
        />

        <form.Field
          name="landingTitle"
          children={(field) => (
            <TextField
              fieldApi={field}
              field={{
                label: typo(`Название для лендинга`),
              }}
            />
          )}
        />

        <form.Field
          name="shortDescription"
          children={(field) => (
            <TextareaField
              fieldApi={field}
              field={{
                label: typo(`Короткое описание`),
              }}
            />
          )}
        />

        <form.Field
          name="imageId"
          children={(field) => (
            <FileUploadField
              fieldApi={field}
              field={{
                inputProps: {
                  isMultiple: false,
                  accept: "image/*",
                },
                label: typo(`Изображение`),
              }}
            />
          )}
        />

        <form.Field
          name="subcategories"
          children={(field) => (
            <SelectMultipleField
              fieldApi={field}
              field={{
                label: typo(`Подкатегории`),
                placeholder: typo(`Выберите подкатегории`),
                inputProps: {
                  options: subcategoryOptions,
                },
              }}
            />
          )}
        />

        <form.Field
          name="isHidden"
          children={(field) => (
            <SwitchField
              fieldApi={field}
              field={{
                label: typo(`Скрыта на сайте`),
              }}
            />
          )}
        />
      </VStack>
    );
  }, [form, subcategoryOptions]);

  const formButton = (
    <CrudTableFormButton form={form} label={isCreation ? typo("Создать") : typo("Сохранить")} />
  );

  return (
    <>
      <SidePanel
        title={typo(`Детали`)}
        isOpen={!isCreation}
        onClose={props.onClose}
        buttons={
          <CrudTableSidePanelDetailsButtons onEdit={openEdit} onDelete={handleDelete} isDeleting={isDeleting} />
        }
      >
        {isPending ? <Skeleton className="h-[400px]" /> : undefined}
        {data ? <CategoryDetails data={data} /> : undefined}
      </SidePanel>

      <SidePanel
        title={typo(`Редактирование`)}
        isOpen={!isCreation && isEditOpened}
        onClose={handleCloseEdit}
        buttons={formButton}
      >
        {fields}
      </SidePanel>

      <SidePanel title={typo(`Создание`)} isOpen={isCreation} onClose={props.onClose} buttons={formButton}>
        {fields}
      </SidePanel>
    </>
  );
};
