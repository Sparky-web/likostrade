import type { ColumnSort, Row, RowData } from "@tanstack/react-table";
import type * as React from "react";

import type { DataTableConfig } from "./config";
import type { FilterItemSchema } from "./lib/parsers";

// Имена TData/TValue совпадают с @tanstack/react-table для корректного module augmentation merge.
/* eslint-disable @typescript-eslint/no-unused-vars */
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    queryKeys?: QueryKeys;
    /** Обработчик клика по строке — задаётся из `useDataTable`; см. `DataTable`. */
    onRowClick?: (row: Row<TData>) => void;
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
    placeholder?: string;
    variant?: FilterVariant;
    options?: Option[];
    range?: [number, number];
    unit?: string;
    icon?: React.FC<React.SVGProps<SVGSVGElement>>;
    includeHiddenCategories?: boolean;
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export interface QueryKeys {
  page: string;
  perPage: string;
  sort: string;
  filters: string;
  joinOperator: string;
}

export interface Option {
  label: string;
  value: string;
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

export type FilterOperator = DataTableConfig["operators"][number];
export type FilterVariant = DataTableConfig["filterVariants"][number];
export type JoinOperator = DataTableConfig["joinOperators"][number];

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: Extract<keyof TData, string>;
}

export interface ExtendedColumnFilter<TData> extends FilterItemSchema {
  id: Extract<keyof TData, string>;
}

export interface DataTableRowAction<TData> {
  row: Row<TData>;
  variant: "update" | "delete";
}
