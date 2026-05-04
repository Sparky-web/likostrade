"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { typo } from "lib";
import { useMemo } from "react";

import type { RouterOutputs } from "~/trpc/react";

type VideoRow = RouterOutputs["videos"]["get"][number];

export const useVideosColumns = () => {
  return useMemo<ColumnDef<VideoRow>[]>(
    () => [
      {
        header: typo("ID"),
        accessorKey: "id",
      },
      {
        header: typo("Название"),
        accessorKey: "title",
      },
      {
        header: typo("URL"),
        accessorKey: "url",
      },
      {
        id: "category",
        header: typo("Категория"),
        accessorFn: (row) => row.category?.title ?? "—",
      },
    ],
    [],
  );
};
