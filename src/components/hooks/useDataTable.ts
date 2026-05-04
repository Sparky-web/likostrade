import "~/components/blaze/DataTable/types";

import {
  type ColumnDef,
  type ColumnFiltersState,
  functionalUpdate,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
  type Updater,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  type SingleParser,
  useQueryState,
  type UseQueryStateOptions,
  useQueryStates,
} from "nuqs";
import * as React from "react";

import { getSortingStateParser } from "~/components/blaze/DataTable/lib/parsers";
import type { ExtendedColumnSort, QueryKeys } from "~/components/blaze/DataTable/types";
import { useDebouncedCallback } from "~/components/hooks/useDebouncedCallback";

const PAGE_KEY = "page";
const PER_PAGE_KEY = "perPage";
const SORT_KEY = "sort";
const FILTERS_KEY = "filters";
const JOIN_OPERATOR_KEY = "joinOperator";
const ARRAY_SEPARATOR = ",";
const DEBOUNCE_MS = 300;
const THROTTLE_MS = 50;

/**
 * Если `meta.label` не задан, а `header` — строка, подставляет `label` из `header`
 * (тулбар, видимость колонок и т.п.). Групповые колонки обрабатываются рекурсивно.
 */
function withDefaultColumnMetaLabel<TData>(column: ColumnDef<TData>): ColumnDef<TData> {
  let next: ColumnDef<TData> = column;
  if ("columns" in column && Array.isArray(column.columns) && column.columns.length > 0) {
    next = {
      ...column,
      columns: column.columns.map((c) => withDefaultColumnMetaLabel(c)),
    };
  }
  if (typeof next.header !== "string") return next;
  if (next.meta?.label !== undefined && next.meta.label !== "") return next;
  return {
    ...next,
    meta: {
      ...next.meta,
      label: next.header,
    },
  };
}

interface UseDataTableProps<TData> extends Omit<
  TableOptions<TData>,
  "state" | "pageCount" | "getCoreRowModel" | "manualFiltering" | "manualPagination" | "manualSorting"
> {
  /** В режиме серверных данных задаётся общее число страниц; для клиентских данных не используется. */
  pageCount?: number;
  initialState?: Omit<Partial<TableState>, "sorting"> & {
    sorting?: ExtendedColumnSort<TData>[];
  };
  queryKeys?: Partial<QueryKeys>;
  history?: "push" | "replace";
  debounceMs?: number;
  throttleMs?: number;
  clearOnDefault?: boolean;
  enableAdvancedFilter?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  startTransition?: React.TransitionStartFunction;
  /**
   * Полный набор строк на клиенте (демо, локальные данные).
   * Если `true`, TanStack применяет сортировку, фильтры и пагинацию к `data` сам.
   * Если `false` (режим API), ожидается сортировка/фильтр/страница на сервере — `manual*` остаются включёнными.
   */
  clientSideProcessing?: boolean;
  /** Если задан — строка подсвечивается при наведении (`bg-accent`), по клику вызывается обработчик (см. `DataTable`). */
  onRowClick?: (row: Row<TData>) => void;
}

export function useDataTable<TData>(props: UseDataTableProps<TData>) {
  const {
    columns,
    pageCount: pageCountProp = -1,
    initialState,
    queryKeys,
    history = "replace",
    debounceMs = DEBOUNCE_MS,
    throttleMs = THROTTLE_MS,
    clearOnDefault = false,
    enableAdvancedFilter = false,
    scroll = false,
    shallow = true,
    startTransition,
    clientSideProcessing = false,
    onRowClick,
    ...tableProps
  } = props;

  const resolvedColumns = React.useMemo(
    () => columns.map((column) => withDefaultColumnMetaLabel(column)),
    [columns],
  );

  const pageKey = queryKeys?.page ?? PAGE_KEY;
  const perPageKey = queryKeys?.perPage ?? PER_PAGE_KEY;
  const sortKey = queryKeys?.sort ?? SORT_KEY;
  const filtersKey = queryKeys?.filters ?? FILTERS_KEY;
  const joinOperatorKey = queryKeys?.joinOperator ?? JOIN_OPERATOR_KEY;

  const queryStateOptions = React.useMemo<Omit<UseQueryStateOptions<string>, "parse">>(
    () => ({
      history,
      scroll,
      shallow,
      throttleMs,
      debounceMs,
      clearOnDefault,
      startTransition,
    }),
    [history, scroll, shallow, throttleMs, debounceMs, clearOnDefault, startTransition],
  );

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>(initialState?.rowSelection ?? {});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialState?.columnVisibility ?? {});

  const [page, setPage] = useQueryState(pageKey, parseAsInteger.withOptions(queryStateOptions).withDefault(1));
  const [perPage, setPerPage] = useQueryState(
    perPageKey,
    parseAsInteger.withOptions(queryStateOptions).withDefault(initialState?.pagination?.pageSize ?? 10),
  );

  const pagination: PaginationState = React.useMemo(() => {
    return {
      pageIndex: page - 1, // zero-based index -> one-based index
      pageSize: perPage,
    };
  }, [page, perPage]);

  /**
   * Актуальное состояние пагинации для TanStack updater'ов (см. onPaginationChange).
   * Обновление из nuqs только в эффекте: иначе присваивание ref в ререндере затирает
   * значение до прихода апдейта URL и поломает быстрые клики/цепочки setPage/setPerPage.
   */
  const paginationRef = React.useRef<PaginationState>(pagination);
  React.useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const onPaginationChange = React.useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      const newPagination = functionalUpdate(updaterOrValue, paginationRef.current);
      paginationRef.current = newPagination;
      void setPage(newPagination.pageIndex + 1);
      void setPerPage(newPagination.pageSize);
    },
    [setPage, setPerPage],
  );

  const columnIds = React.useMemo(() => {
    return new Set(resolvedColumns.map((column) => column.id).filter(Boolean) as string[]);
  }, [resolvedColumns]);

  const [sorting, setSorting] = useQueryState(
    sortKey,
    getSortingStateParser<TData>(columnIds)
      .withOptions(queryStateOptions)
      .withDefault(initialState?.sorting ?? []),
  );

  const onSortingChange = React.useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      void setSorting((prev) => functionalUpdate(updaterOrValue, prev ?? []) as ExtendedColumnSort<TData>[]);
    },
    [setSorting],
  );

  const filterableColumns = React.useMemo(() => {
    if (enableAdvancedFilter) return [];

    return resolvedColumns.filter((column) => column.enableColumnFilter);
  }, [resolvedColumns, enableAdvancedFilter]);

  const filterParsers = React.useMemo(() => {
    if (enableAdvancedFilter) return {};

    return filterableColumns.reduce<Record<string, SingleParser<string> | SingleParser<string[]>>>((acc, column) => {
      if (column.meta?.options) {
        acc[column.id ?? ""] = parseAsArrayOf(parseAsString, ARRAY_SEPARATOR).withOptions(queryStateOptions);
      } else {
        acc[column.id ?? ""] = parseAsString.withOptions(queryStateOptions);
      }
      return acc;
    }, {});
  }, [filterableColumns, queryStateOptions, enableAdvancedFilter]);

  const [filterValues, setFilterValues] = useQueryStates(filterParsers);

  const debouncedSetFilterValues = useDebouncedCallback((values: typeof filterValues) => {
    void setPage(1);
    void setFilterValues(values);
  }, debounceMs);

  const initialColumnFilters: ColumnFiltersState = React.useMemo(() => {
    if (enableAdvancedFilter) return [];

    return Object.entries(filterValues).reduce<ColumnFiltersState>((filters, [key, value]) => {
      if (value !== null) {
        const processedValue = Array.isArray(value)
          ? value
          : typeof value === "string" && /[^a-zA-Z0-9]/.test(value)
            ? value.split(/[^a-zA-Z0-9]+/).filter(Boolean)
            : [value];

        filters.push({
          id: key,
          value: processedValue,
        });
      }
      return filters;
    }, []);
  }, [filterValues, enableAdvancedFilter]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(initialColumnFilters);

  const filtersUrlSignature = React.useMemo(() => JSON.stringify(filterValues), [filterValues]);

  // Синхронизация фильтров с URL (гидрация, назад/вперёд): nuqs мог обновиться после первого рендера.
  React.useEffect(() => {
    setColumnFilters(initialColumnFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- намеренно по снимку filterValues
  }, [filtersUrlSignature]);

  const onColumnFiltersChange = React.useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      if (enableAdvancedFilter) return;

      setColumnFilters((prev) => {
        const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;

        const filterUpdates = next.reduce<Record<string, string | string[] | null>>((acc, filter) => {
          if (filterableColumns.find((column) => column.id === filter.id)) {
            acc[filter.id] = filter.value as string | string[];
          }
          return acc;
        }, {});

        for (const prevFilter of prev) {
          if (!next.some((filter) => filter.id === prevFilter.id)) {
            filterUpdates[prevFilter.id] = null;
          }
        }

        debouncedSetFilterValues(filterUpdates);
        return next;
      });
    },
    [debouncedSetFilterValues, filterableColumns, enableAdvancedFilter],
  );

  const pageCount = clientSideProcessing ? undefined : pageCountProp;

  const table = useReactTable({
    ...tableProps,
    columns: resolvedColumns,
    initialState,
    pageCount,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    defaultColumn: {
      enableColumnFilter: false,
      ...tableProps.defaultColumn,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onPaginationChange,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    manualPagination: !clientSideProcessing,
    manualSorting: !clientSideProcessing,
    manualFiltering: !clientSideProcessing,
    meta: {
      ...tableProps.meta,
      ...(onRowClick !== undefined ? { onRowClick } : {}),
      queryKeys: {
        page: pageKey,
        perPage: perPageKey,
        sort: sortKey,
        filters: filtersKey,
        joinOperator: joinOperatorKey,
      },
    },
  });

  return React.useMemo(() => ({ table, shallow, debounceMs, throttleMs }), [table, shallow, debounceMs, throttleMs]);
}
