"use client";

import { type ColumnDef, type FilterFn } from "@tanstack/react-table";
import { typo } from "lib";
import { useMemo } from "react";

import type { RouterOutputs } from "~/trpc/react";

type ProjectRow = RouterOutputs["projects"]["get"][number];

const EMPTY = "—";

/** Проект попадает в выборку, если связан хотя бы с одной из выбранных категорий. */
const projectCategoryFilterFn: FilterFn<ProjectRow> = (row, _columnId, filterValue) => {
  const selected = filterValue as string[] | undefined;
  if (!selected?.length) return true;
  const ids = row.original.categories.map((category) => category.id);
  return selected.some((id) => ids.includes(id));
};

export const useProjectsColumns = () => {
  return useMemo<ColumnDef<ProjectRow>[]>(
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
        id: "categories",
        header: typo("Категории"),
        accessorFn: (row) => row.categories.map((category) => category.title).join(", ") || EMPTY,
        cell: ({ row }) => {
          const titles = row.original.categories.map((category) => category.title);
          return titles.length ? titles.join(", ") : EMPTY;
        },
        enableColumnFilter: true,
        filterFn: projectCategoryFilterFn,
        meta: {
          label: typo("Категории"),
          variant: "categoryTreeMultiSelect",
          includeHiddenCategories: true,
        },
      },
      {
        header: typo("Дата выполнения"),
        accessorKey: "dateCompleted",
      },
      {
        header: typo("Цена"),
        accessorKey: "price",
      },
      {
        header: typo("Скрыт"),
        accessorFn: (row) => (row.isHidden ? typo("Да") : typo("Нет")),
      },
    ],
    [],
  );
};
