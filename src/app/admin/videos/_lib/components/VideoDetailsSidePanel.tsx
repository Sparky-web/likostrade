"use client";

import { typo } from "lib";
import { useMemo } from "react";

import { useCategoryOptions } from "~/app/admin/_lib";
import {
  CrudTableFormButton,
  CrudTableSidePanelDetailsButtons,
  SelectField,
  SidePanel,
  Skeleton,
  TextareaField,
  TextField,
  useToggle,
  VStack,
} from "~/components";

import { useVideoForm } from "../model/useVideoForm";
import { VideoDetails } from "./VideoDetails";

export type VideoDetailsSidePanelProps = {
  onClose: () => void;
} & (
  | {
      selectedId: string;
    }
  | {
      isCreation: true;
    }
);

export const VideoDetailsSidePanel = (props: VideoDetailsSidePanelProps) => {
  const { isToggled: isEditOpened, setTruthy: openEdit, setFalsy: closeEdit } = useToggle(false);

  const isCreation = "isCreation" in props;
  const selectedId = "selectedId" in props ? props.selectedId : undefined;

  const { data, isPending, refetch, form, handleDelete, isDeleting } = useVideoForm({
    selectedId,
    isCreation,
    onCreated: props.onClose,
    onUpdated: closeEdit,
    onDeleted: props.onClose,
  });

  const categoryOptions = useCategoryOptions();

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
          name="description"
          children={(field) => <TextareaField fieldApi={field} field={{ label: typo("Описание") }} />}
        />

        <form.Field
          name="url"
          children={(field) => (
            <TextField
              fieldApi={field}
              field={{
                label: typo("URL"),
                placeholder: typo("Ссылка на видео"),
              }}
            />
          )}
        />

        <form.Field
          name="categoryId"
          children={(field) => (
            <SelectField
              fieldApi={field}
              field={{
                label: typo("Категория"),
                placeholder: typo("Выберите категорию"),
                inputProps: { options: categoryOptions },
              }}
            />
          )}
        />
      </VStack>
    );
  }, [form, categoryOptions]);

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
        {data ? <VideoDetails data={data} /> : undefined}
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
