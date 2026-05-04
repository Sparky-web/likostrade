"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { typo } from "lib";
import { useMemo } from "react";

import type { RouterOutputs } from "~/trpc/react";

type CategoryRow = RouterOutputs["categories"]["get"][number];

export const useCategoriesColumns = () => {
  return useMemo<ColumnDef<CategoryRow>[]>(
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
        header: typo("Скрыта"),
        accessorKey: "isHidden",
        cell: ({ getValue }) => (getValue<boolean>() ? typo("Да") : typo("Нет")),
      },
      {
        id: "parentCategories",
        header: typo("Родительские категории"),
        // accessorFn нужен потому что parentCategories — массив объектов, а не плоское поле
        accessorFn: (row) =>
          row.parentCategories.length ? row.parentCategories.map((parent) => parent.title).join(", ") : "—",
      },
    ],
    [],
  );
};
