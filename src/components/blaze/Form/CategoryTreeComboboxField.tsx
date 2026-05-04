"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { useId } from "react";

import { CategoryTreeCombobox } from "~/components/custom/CategoryTreeCombobox/CategoryTreeCombobox";
import { cn } from "~/components/utils/cn";

import { FormFieldWrap } from "./FormFieldWrap";
import type { FormFieldBaseForComponents } from "./types";
import { ERROR_CLASS_NAMES } from "./utils";

export type CategoryTreeComboboxFieldInputProps = {
  className?: string;
  allowedCategoryIds?: string[];
  includeHidden?: boolean;
  placeholder?: string;
};

type CategoryTreeComboboxFieldProps = {
  field: FormFieldBaseForComponents & { inputProps?: CategoryTreeComboboxFieldInputProps };
  fieldApi: AnyFieldApi;
};

function normalizeToIdArray(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string" && item.length > 0);
  }
  return [];
}

export const CategoryTreeComboboxField = ({ field, fieldApi }: CategoryTreeComboboxFieldProps) => {
  const fallbackId = useId();
  const id = field.id ?? fallbackId;
  const hasError = fieldApi.state.meta.errors.length > 0;
  const selectedCategories = normalizeToIdArray(fieldApi.state.value);
  const { className, allowedCategoryIds, includeHidden, placeholder } = {
    ...field.inputProps,
  };

  return (
    <FormFieldWrap label={field.label} fieldApi={fieldApi} id={id}>
      <CategoryTreeCombobox
        selectedCategories={selectedCategories}
        onCategoriesChange={(ids) => fieldApi.handleChange(ids)}
        allowedCategoryIds={allowedCategoryIds}
        includeHidden={includeHidden}
        placeholder={placeholder ?? field.placeholder}
        className={cn("max-w-none", className, hasError && ERROR_CLASS_NAMES)}
      />
    </FormFieldWrap>
  );
};
