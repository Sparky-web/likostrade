"use client";

import { typo } from "lib";
import { useMemo } from "react";

import {
  CrudTableFormButton,
  CrudTableSidePanelDetailsButtons,
  FileUploadField,
  SidePanel,
  Skeleton,
  TextField,
  useToggle,
  VStack,
} from "~/components";

import { useFileForm } from "../model/useFileForm";
import { FileDetails } from "./FileDetails";

export type FileDetailsSidePanelProps = {
  onClose: () => void;
} & (
  | {
      selectedId: string;
    }
  | {
      isCreation: true;
    }
);

export const FileDetailsSidePanel = (props: FileDetailsSidePanelProps) => {
  const { isToggled: isEditOpened, setTruthy: openEdit, setFalsy: closeEdit } = useToggle(false);

  const isCreation = "isCreation" in props;
  const selectedId = "selectedId" in props ? props.selectedId : undefined;

  const { data, isPending, refetch, form, handleDelete, isDeleting } = useFileForm({
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

  // В режиме создания показываем загрузчик файла + alt; в редактировании — только alt,
  // т.к. сама бинарная сущность файла остаётся прежней
  const fields = useMemo(() => {
    return (
      <VStack gap="lg">
        {isCreation ? (
          <form.Field
            name="image"
            children={(field) => (
              <FileUploadField
                fieldApi={field}
                field={{
                  label: typo("Файл"),
                  inputProps: {
                    isMultiple: false,
                  },
                }}
              />
            )}
          />
        ) : null}

        <form.Field
          name="alt"
          children={(field) => <TextField fieldApi={field} field={{ label: typo("Alt") }} />}
        />
      </VStack>
    );
  }, [form, isCreation]);

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
        {data ? <FileDetails data={data} /> : undefined}
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
