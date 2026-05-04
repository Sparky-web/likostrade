"use client";

import { typo } from "lib";
import { useEffect, useMemo } from "react";

import {
  Checkbox,
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  FieldLabel,
  type SelectFieldOption,
  useComboboxAnchor,
  VStack,
} from "~/components";
import { cn } from "~/components/utils/cn";

import { flattenCategoryTree } from "./lib/flattenCategoryTree";
import {
  areCategorySelectionsEqual,
  getCategoryCheckState,
  getDisplayCategoryIds,
  normalizeCategorySelection,
  removeCategoryBranch,
  toggleCategorySelection,
} from "./model/categoryTreeSelection";
import { useCategoryTreeData } from "./model/useCategoryTreeData";

export type CategoryTreeComboboxProps = {
  selectedCategories: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
  /** Ограничить дерево категориями из списка (с сохранением предков). */
  allowedCategoryIds?: string[];
  /** Включить скрытые на сайте категории (для админки). */
  includeHidden?: boolean;
  label?: string;
  className?: string;
  placeholder?: string;
};

export const CategoryTreeCombobox = ({
  selectedCategories,
  onCategoriesChange,
  allowedCategoryIds,
  includeHidden,
  label,
  className,
  placeholder,
}: CategoryTreeComboboxProps) => {
  const anchorRef = useComboboxAnchor();
  const { categories, categoriesById, tree, isPending } = useCategoryTreeData({ allowedCategoryIds, includeHidden });

  const flatItems = useMemo(() => flattenCategoryTree(tree), [tree]);

  const normalizedSelected = useMemo(() => normalizeCategorySelection(selectedCategories, tree), [selectedCategories, tree]);

  useEffect(() => {
    if (tree.length === 0) return;
    if (!areCategorySelectionsEqual(normalizedSelected, selectedCategories)) {
      onCategoriesChange(normalizedSelected);
    }
  }, [normalizedSelected, selectedCategories, tree, onCategoriesChange]);

  const displayIds = useMemo(() => getDisplayCategoryIds(normalizedSelected, tree), [normalizedSelected, tree]);

  const displayItems = useMemo<SelectFieldOption[]>(
    () =>
      displayIds.map((id) => ({
        value: id,
        label: typo(categoriesById.get(id)?.title ?? id),
      })),
    [displayIds, categoriesById],
  );

  const comboboxItems = useMemo<SelectFieldOption[]>(
    () => flatItems.map(({ node }) => ({ value: node.id, label: typo(node.title) })),
    [flatItems],
  );

  const flatItemById = useMemo(() => new Map(flatItems.map((item) => [item.node.id, item])), [flatItems]);

  const handleChipValueChange = (next: SelectFieldOption[]) => {
    const nextIds = new Set(next.map((item) => item.value));
    const removedIds = displayIds.filter((id) => !nextIds.has(id));

    if (removedIds.length === 0) return;

    let nextSelected = normalizedSelected;

    for (const id of removedIds) {
      const node = flatItems.find((item) => item.node.id === id)?.node;
      if (node == null) continue;
      nextSelected = removeCategoryBranch(nextSelected, node, categories, tree);
    }

    onCategoriesChange(nextSelected);
  };

  return (
    <VStack gap="sm" className={cn("w-full max-w-3xl", className)}>
      {label != null ? <FieldLabel>{label}</FieldLabel> : null}
      <Combobox multiple items={comboboxItems} value={displayItems} onValueChange={handleChipValueChange} disabled={isPending}>
        <ComboboxChips ref={anchorRef} className="min-h-12 w-full flex-wrap gap-2 py-2.5">
          <ComboboxValue>
            {(selected: SelectFieldOption[]) =>
              selected.map((item) => (
                <ComboboxChip
                  key={item.value}
                  className="h-auto max-w-full shrink py-1.5 text-left leading-snug whitespace-normal"
                >
                  {item.label}
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxChipsInput placeholder={placeholder ?? typo("Выберите категории")} className="min-w-[12rem] flex-1" />
        </ComboboxChips>
        <ComboboxContent anchor={anchorRef} className="min-w-[min(100%,32rem)]">
          <ComboboxEmpty>{typo("Ничего не найдено")}</ComboboxEmpty>
          <ComboboxList>
            {(item: SelectFieldOption) => {
              const flat = flatItemById.get(item.value);
              if (flat == null) return null;

              const { node, depth } = flat;
              const checkState = getCategoryCheckState(node, normalizedSelected);

              return (
                <ComboboxItem
                  key={node.id}
                  value={item}
                  className="h-auto items-start gap-2 py-2.5 whitespace-normal"
                  style={{ paddingLeft: `calc(0.75rem + ${depth} * 1.25rem)` }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const select = checkState !== "checked";
                    onCategoriesChange(toggleCategorySelection(normalizedSelected, node, select, categories, tree));
                  }}
                >
                  <Checkbox
                    checked={checkState === "indeterminate" ? "indeterminate" : checkState === "checked"}
                    className="pointer-events-none mt-0.5"
                    tabIndex={-1}
                    aria-hidden
                  />
                  <span className="leading-snug text-pretty">{item.label}</span>
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </VStack>
  );
};
