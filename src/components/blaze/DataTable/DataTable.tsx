import { flexRender, type Header, type Table as TanstackTable } from "@tanstack/react-table";
import { typo } from "lib";
import type * as React from "react";

import { DataTableColumnHeader } from "~/components/blaze/DataTable/DataTableColumnHeader";
import { DataTablePagination } from "~/components/blaze/DataTable/DataTablePagination";
import { getColumnPinningStyle } from "~/components/blaze/DataTable/lib/dataTableHelpers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { cn } from "~/components/utils/cn";

/** Строковый `header` колонки оборачивается в `DataTableColumnHeader` (сортировка, скрытие). */
function renderColumnHeader<TData>(header: Header<TData, unknown>) {
  if (header.isPlaceholder) return null;

  const raw = header.column.columnDef.header;
  if (typeof raw === "string") {
    return <DataTableColumnHeader column={header.column} label={raw} />;
  }

  return flexRender(raw, header.getContext());
}
interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
}

export function DataTable<TData>({ table, actionBar, children, className, ...props }: DataTableProps<TData>) {
  const onRowClick = table.options?.meta?.onRowClick;

  return (
    <div className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)} {...props}>
      {children}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      ...getColumnPinningStyle({ column: header.column }),
                    }}
                  >
                    {renderColumnHeader(header)}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  /* Фон задаётся инлайном на td в `getColumnPinningStyle`, без классов на ячейках hover строки не виден */
                  className={onRowClick ? "group/row cursor-pointer" : undefined}
                  onClick={
                    onRowClick
                      ? (e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('button, a, input, select, textarea, [role="checkbox"]')) {
                            return;
                          }
                          onRowClick(row);
                        }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        ...getColumnPinningStyle({ column: cell.column }),
                      }}
                      className={
                        onRowClick ? cn("group-data-[state=selected]/row:!bg-muted", "group-hover/row:!bg-accent") : undefined
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                  {typo("Нет данных.")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {actionBar && table.getFilteredSelectedRowModel().rows.length > 0 && actionBar}
      </div>
    </div>
  );
}
