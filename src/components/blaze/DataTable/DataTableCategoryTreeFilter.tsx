"use client";

import type { Column } from "@tanstack/react-table";
import { typo, typoRaw } from "lib";
import { PlusCircle, XCircle } from "lucide-react";
import * as React from "react";

import { CategoryTreeCombobox } from "~/components/custom/CategoryTreeCombobox/CategoryTreeCombobox";
import {
  getDisplayCategoryIds,
  normalizeCategorySelection,
} from "~/components/custom/CategoryTreeCombobox/model/categoryTreeSelection";
import { useCategoryTreeData } from "~/components/custom/CategoryTreeCombobox/model/useCategoryTreeData";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";

type DataTableCategoryTreeFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>;
  title?: string;
  includeHidden?: boolean;
};

function parseStringArrayFilter(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function DataTableCategoryTreeFilter<TData, TValue>({
  column,
  title,
  includeHidden,
}: DataTableCategoryTreeFilterProps<TData, TValue>) {
  const [open, setOpen] = React.useState(false);
  const selectedCategories = React.useMemo(
    () => parseStringArrayFilter(column?.getFilterValue()),
    [column],
  );

  const { tree, categoriesById } = useCategoryTreeData({ includeHidden });
  const normalizedSelected = React.useMemo(
    () => normalizeCategorySelection(selectedCategories, tree),
    [selectedCategories, tree],
  );
  const displayIds = React.useMemo(() => getDisplayCategoryIds(normalizedSelected, tree), [normalizedSelected, tree]);

  const onReset = React.useCallback(
    (event?: React.MouseEvent) => {
      event?.stopPropagation();
      column?.setFilterValue(undefined);
    },
    [column],
  );

  const onCategoriesChange = React.useCallback(
    (categoryIds: string[]) => {
      column?.setFilterValue(categoryIds.length > 0 ? categoryIds : undefined);
    },
    [column],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-dashed font-normal">
          {displayIds.length > 0 ? (
            <div
              role="button"
              aria-label={
                title !== undefined && title !== "" ? `${typo("Сбросить фильтр")}: ${title}` : typo("Сбросить фильтр")
              }
              tabIndex={0}
              className="focus-visible:ring-ring rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-1 focus-visible:outline-none"
              onClick={onReset}
            >
              <XCircle />
            </div>
          ) : (
            <PlusCircle />
          )}
          {title}
          {displayIds.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-0.5 data-[orientation=vertical]:h-4" />
              <Badge variant="secondary" className="h-6 min-h-6 rounded-sm px-1 text-xs font-normal lg:hidden">
                {displayIds.length}
              </Badge>
              <div className="hidden items-center gap-1 lg:flex">
                {displayIds.length > 2 ? (
                  <Badge variant="secondary" className="h-6 min-h-6 rounded-sm px-1 text-xs font-normal">
                    {typoRaw("Выбрано: {n}", { n: String(displayIds.length) })}
                  </Badge>
                ) : (
                  displayIds.map((id) => (
                    <Badge
                      variant="secondary"
                      key={id}
                      className="h-6 min-h-6 max-w-48 truncate rounded-sm px-1 text-xs font-normal"
                    >
                      {categoriesById.get(id)?.title ?? id}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="inverted w-[min(calc(100vw-2rem),36rem)] p-3" align="start">
        <CategoryTreeCombobox
          selectedCategories={selectedCategories}
          onCategoriesChange={onCategoriesChange}
          includeHidden={includeHidden}
          className="max-w-none"
        />
      </PopoverContent>
    </Popover>
  );
}
