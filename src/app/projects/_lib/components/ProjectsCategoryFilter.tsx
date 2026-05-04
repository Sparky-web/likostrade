"use client";

import { typo } from "lib";

import { CategoryTreeCombobox } from "~/components";

type ProjectsCategoryFilterProps = {
  allowedCategoryIds: string[];
  selectedCategories: string[];
  onCategoriesChange: (categoryIds: string[]) => void;
};

export const ProjectsCategoryFilter = ({
  allowedCategoryIds,
  selectedCategories,
  onCategoriesChange,
}: ProjectsCategoryFilterProps) => {
  return (
    <CategoryTreeCombobox
      label={typo("Категории")}
      allowedCategoryIds={allowedCategoryIds}
      selectedCategories={selectedCategories}
      onCategoriesChange={onCategoriesChange}
    />
  );
};
