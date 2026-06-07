"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { typo } from "lib";
import { useMemo } from "react";

import type { RouterOutputs } from "~/trpc/react";

type LeadRow = RouterOutputs["leads"]["get"][number];

const EMPTY = "—";
const MESSAGE_PREVIEW_LENGTH = 80;

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

const truncateMessage = (message: string | null | undefined) => {
  if (!message) return EMPTY;
  if (message.length <= MESSAGE_PREVIEW_LENGTH) return message;
  return `${message.slice(0, MESSAGE_PREVIEW_LENGTH)}…`;
};

export const useLeadsColumns = () => {
  return useMemo<ColumnDef<LeadRow>[]>(
    () => [
      {
        id: "createdAt",
        header: typo("Дата заявки"),
        accessorFn: (row) => dateFormatter.format(row.createdAt),
      },
      {
        header: typo("Название"),
        accessorKey: "title",
      },
      {
        id: "category",
        header: typo("Категория"),
        accessorFn: (row) => row.category?.title ?? EMPTY,
      },
      {
        id: "project",
        header: typo("Проект"),
        accessorFn: (row) => row.project?.title ?? EMPTY,
      },
      {
        id: "message",
        header: typo("Сообщение"),
        accessorFn: (row) => truncateMessage(row.message),
      },
      {
        header: typo("Email"),
        accessorKey: "email",
      },
      {
        id: "files",
        header: typo("Вложения"),
        accessorFn: (row) => (row.files.length > 0 ? String(row.files.length) : EMPTY),
      },
    ],
    [],
  );
};
