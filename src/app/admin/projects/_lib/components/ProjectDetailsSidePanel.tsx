"use client";

import { typo } from "lib";
import { useMemo } from "react";

import {
  CategoryTreeComboboxField,
  CrudTableFormButton,
  CrudTableSidePanelDetailsButtons,
  DateField,
  FileUploadField,
  RichTextareaField,
  SidePanel,
  Skeleton,
  SwitchField,
  TextareaField,
  TextField,
  useToggle,
  VStack,
} from "~/components";

import { useProjectForm } from "../model/useProjectForm";
import { ProjectDetails } from "./ProjectDetails";

export type ProjectDetailsSidePanelProps = {
  onClose: () => void;
} & (
  | {
      selectedId: string;
    }
  | {
      isCreation: true;
    }
);

export const ProjectDetailsSidePanel = (props: ProjectDetailsSidePanelProps) => {
  const { isToggled: isEditOpened, setTruthy: openEdit, setFalsy: closeEdit } = useToggle(false);

  const isCreation = "isCreation" in props;
  const selectedId = "selectedId" in props ? props.selectedId : undefined;

  const { data, isPending, refetch, form, handleDelete, isDeleting, dateValidator } = useProjectForm({
    selectedId,
    isCreation,
    onCreated: props.onClose,
    onUpdated: closeEdit,
    onDeleted: props.onClose,
  });

  const handleCloseEdit = () => {
    void refetch();
    closeEdit();
  };

  const fields = useMemo(() => {
    return (
      <VStack gap="lg">
        <form.Field
          name="title"
          children={(field) => <TextField fieldApi={field} field={{ label: typo("Название") }} />}
        />

        <form.Field
          name="shortDescription"
          children={(field) => <TextareaField fieldApi={field} field={{ label: typo("Короткое описание") }} />}
        />

        <form.Field
          name="dateCompleted"
          validators={{ onBlur: dateValidator, onSubmit: dateValidator }}
          children={(field) => <DateField fieldApi={field} field={{ label: typo("Дата выполнения") }} />}
        />

        <form.Field
          name="price"
          children={(field) => <TextField fieldApi={field} field={{ label: typo("Цена") }} />}
        />

        <form.Field
          name="timeToComplete"
          children={(field) => <TextField fieldApi={field} field={{ label: typo("Срок выполнения") }} />}
        />

        <form.Field
          name="mainImageId"
          children={(field) => (
            <FileUploadField
              fieldApi={field}
              field={{
                label: typo("Главное фото"),
                inputProps: {
                  isMultiple: false,
                  accept: "image/*",
                },
              }}
            />
          )}
        />

        <form.Field
          name="additionalImages"
          children={(field) => (
            <FileUploadField
              fieldApi={field}
              field={{
                label: typo("Дополнительные фото"),
                inputProps: {
                  isMultiple: true,
                  accept: "image/*",
                },
              }}
            />
          )}
        />

        <form.Field
          name="task"
          children={(field) => <RichTextareaField fieldApi={field} field={{ label: typo("Задача") }} />}
        />

        <form.Field
          name="workProgress"
          children={(field) => <RichTextareaField fieldApi={field} field={{ label: typo("Процесс работы") }} />}
        />

        <form.Field
          name="result"
          children={(field) => <RichTextareaField fieldApi={field} field={{ label: typo("Результат") }} />}
        />

        <form.Field
          name="categories"
          children={(field) => (
            <CategoryTreeComboboxField
              fieldApi={field}
              field={{
                label: typo("Категории"),
                placeholder: typo("Выберите категории"),
                inputProps: { includeHidden: true },
              }}
            />
          )}
        />

        <form.Field
          name="isHidden"
          children={(field) => (
            <SwitchField fieldApi={field} field={{ label: typo("Скрыть на сайте") }} />
          )}
        />
      </VStack>
    );
  }, [form, dateValidator]);

  const formButton = (
    <CrudTableFormButton form={form} label={isCreation ? typo("Создать") : typo("Сохранить")} />
  );

  return (
    <>
      <SidePanel
        title={typo("Детали")}
        isOpen={!isCreation}
        onClose={props.onClose}
        buttons={
          <CrudTableSidePanelDetailsButtons onEdit={openEdit} onDelete={handleDelete} isDeleting={isDeleting} />
        }
      >
        {isPending ? <Skeleton className="h-[400px]" /> : undefined}
        {data ? <ProjectDetails data={data} /> : undefined}
      </SidePanel>

      <SidePanel
        title={typo("Редактирование")}
        isOpen={!isCreation && isEditOpened}
        onClose={handleCloseEdit}
        buttons={formButton}
      >
        {fields}
      </SidePanel>

      <SidePanel title={typo("Создание")} isOpen={isCreation} onClose={props.onClose} buttons={formButton}>
        {fields}
      </SidePanel>
    </>
  );
};
