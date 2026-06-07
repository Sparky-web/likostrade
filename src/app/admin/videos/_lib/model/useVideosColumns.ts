"use client";

import { type ColumnDef, type FilterFn } from "@tanstack/react-table";
import { typo } from "lib";
import { useMemo } from "react";

import type { RouterOutputs } from "~/trpc/react";

type VideoRow = RouterOutputs["videos"]["get"][number];

const EMPTY = "—";

/** Видео попадает в выборку, если связано хотя бы с одной из выбранных категорий. */
const videoCategoryFilterFn: FilterFn<VideoRow> = (row, _columnId, filterValue) => {
  const selected = filterValue as string[] | undefined;
  if (!selected?.length) return true;
  const ids = row.original.categories.map((category) => category.id);
  return selected.some((id) => ids.includes(id));
};

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
        id: "categories",
        header: typo("Категории"),
        accessorFn: (row) => row.categories.map((category) => category.title).join(", ") || EMPTY,
        cell: ({ row }) => {
          const titles = row.original.categories.map((category) => category.title);
          return titles.length ? titles.join(", ") : EMPTY;
        },
        enableColumnFilter: true,
        filterFn: videoCategoryFilterFn,
        meta: {
          label: typo("Категории"),
          variant: "categoryTreeMultiSelect",
          includeHiddenCategories: true,
        },
      },
    ],
    [],
  );
};
