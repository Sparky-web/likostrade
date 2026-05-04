"use client";

import { typo } from "lib";

import { AdaptiveGrid, Button, PopConfirm } from "~/components";

type CrudTableSidePanelDetailsButtonsProps = {
  // Открытие режима редактирования сайд-панели
  onEdit: () => void;
  // Подтверждённое удаление; обёртка PopConfirm уже обеспечивает шаг подтверждения
  onDelete: () => void;
  isDeleting?: boolean;
};

export const CrudTableSidePanelDetailsButtons = ({ onEdit, onDelete, isDeleting }: CrudTableSidePanelDetailsButtonsProps) => {
  return (
    <AdaptiveGrid
      cols={{
        base: 2,
      }}
      gap="lg"
    >
      <Button onClick={onEdit}>{typo("Редактировать")}</Button>
      <PopConfirm onConfirm={onDelete}>
        <Button variant="destructive" isLoading={isDeleting}>
          {typo("Удалить")}
        </Button>
      </PopConfirm>
    </AdaptiveGrid>
  );
};
