"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { typo } from "lib";
import { useMemo } from "react";

import type { RouterOutputs } from "~/trpc/react";

type FileRow = RouterOutputs["files"]["get"][number];

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

export const useFilesColumns = () => {
  return useMemo<ColumnDef<FileRow>[]>(
    () => [
      {
        header: typo("ID"),
        accessorKey: "id",
      },
      {
        header: typo("Alt"),
        accessorKey: "alt",
      },
      {
        id: "createdAt",
        header: typo("Создан"),
        accessorFn: (row) => dateFormatter.format(row.createdAt),
      },
    ],
    [],
  );
};
