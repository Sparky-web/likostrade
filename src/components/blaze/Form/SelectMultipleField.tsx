"use client";

import type { ComboboxRoot } from "@base-ui/react/combobox";
import type { AnyFieldApi } from "@tanstack/react-form";
import { typo } from "lib";
import { useId } from "react";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "~/components/ui/combobox";
import { cn } from "~/components/utils/cn";

import { FormFieldWrap } from "./FormFieldWrap";
import { type SelectFieldOption,SelectFieldOptionContent } from "./SelectField";
import type { FormFieldBaseForComponents } from "./types";
import { ERROR_CLASS_NAMES } from "./utils";

/** Список опций и доп. пропсы мультикомбобокса. `className` — у контейнера чипсов. */
export type SelectMultipleFieldInputProps = Omit<
  ComboboxRoot.Props<SelectFieldOption, true>,
  "children" | "value" | "defaultValue" | "onValueChange" | "items" | "multiple"
> & {
  className?: string;
  options: SelectFieldOption[];
};

interface SelectMultipleFieldProps {
  field: FormFieldBaseForComponents & { inputProps?: SelectMultipleFieldInputProps };
  fieldApi: AnyFieldApi;
}

/** Приводит значение поля к массиву непустых строк (`value` опций). */
function normalizeToIdArray(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.filter((item): item is string => typeof item === "string" && item.length > 0);
  }
  return [];
}

export const SelectMultipleField = ({ field, fieldApi }: SelectMultipleFieldProps) => {
  const fallbackId = useId();
  const id = field.id ?? fallbackId;
  const hasError = fieldApi.state.meta.errors.length > 0;
  const anchorRef = useComboboxAnchor();
  const rawSelection = normalizeToIdArray(fieldApi.state.value);
  const {
    options,
    className: chipsClassName,
    ...selectMultipleRootProps
  } = {
    options: [] satisfies SelectFieldOption[],
    ...field.inputProps,
  };
  const selectedItems = options.filter((o) => rawSelection.includes(o.value));

  return (
    <FormFieldWrap label={field.label} fieldApi={fieldApi} id={id}>
      <Combobox
        {...selectMultipleRootProps}
        id={id}
        multiple
        items={options}
        value={selectedItems}
        onValueChange={(next) => {
          fieldApi.handleChange(next.map((item) => item.value));
        }}
      >
        <ComboboxChips
          ref={anchorRef}
          className={cn("w-full min-w-0", chipsClassName, hasError && ERROR_CLASS_NAMES)}
          aria-invalid={hasError || undefined}
        >
          <ComboboxValue>
            {(selected: SelectFieldOption[]) =>
              selected.map((item) => <ComboboxChip key={item.value}>{item.label}</ComboboxChip>)
            }
          </ComboboxValue>
          <ComboboxChipsInput
            placeholder={field.placeholder}
            onBlur={fieldApi.handleBlur}
            className={hasError ? ERROR_CLASS_NAMES : ""}
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchorRef}>
          <ComboboxEmpty>{typo("Ничего не найдено")}</ComboboxEmpty>
          <ComboboxList>
            {(item: SelectFieldOption) => (
              <ComboboxItem key={item.value} value={item} className="h-auto items-start py-2.5 whitespace-normal">
                <SelectFieldOptionContent option={item} />
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FormFieldWrap>
  );
};
