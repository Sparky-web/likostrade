"use client";

import type { ComboboxRoot } from "@base-ui/react/combobox";
import type { AnyFieldApi } from "@tanstack/react-form";
import { typo } from "lib";
import { useId } from "react";

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "~/components/ui/combobox";
import { cn } from "~/components/utils/cn";

import { FormFieldWrap } from "./FormFieldWrap";
import type { FormFieldBaseForComponents } from "./types";

/** Элемент выпадающего списка `select`. */
export type SelectFieldOption = {
  label: string;
  value: string;
  /** Дополнительная подпись под основным текстом (дата, id и т.п.). */
  description?: string;
};

export const SelectFieldOptionContent = ({ option }: { option: SelectFieldOption }) => (
  <span className="flex min-w-0 flex-col gap-0.5">
    <span className="truncate">{option.label}</span>
    {option.description ? <span className="text-muted-foreground truncate text-xs">{option.description}</span> : null}
  </span>
);

type SelectComboboxRest = Omit<
  ComboboxRoot.Props<SelectFieldOption, false>,
  "children" | "value" | "defaultValue" | "onValueChange" | "items"
> & {
  className?: string;
};

/** Список опций и доп. пропсы корня Combobox. `value`/`onValueChange`/`items` задаёт поле; `className` — на `ComboboxInput`. */
export type SelectFieldInputProps = SelectComboboxRest & {
  options: SelectFieldOption[];
};

interface SelectFieldProps {
  field: FormFieldBaseForComponents & { inputProps?: SelectFieldInputProps };
  fieldApi: AnyFieldApi;
}

export const SelectField = ({ field, fieldApi }: SelectFieldProps) => {
  const fallbackId = useId();
  const id = field.id ?? fallbackId;
  const hasError = fieldApi.state.meta.errors.length > 0;
  const raw = fieldApi.state.value as string | undefined | null;
  const {
    options,
    className: selectClassName,
    ...selectRootProps
  } = {
    options: [] satisfies SelectFieldOption[],
    ...field.inputProps,
  };
  const selectedOption =
    raw === "" || raw === undefined || raw === null ? null : (options.find((o) => o.value === raw) ?? null);

  return (
    <FormFieldWrap label={field.label} fieldApi={fieldApi} id={id}>
      <Combobox
        {...selectRootProps}
        id={id}
        items={options}
        value={selectedOption}
        onValueChange={(next) => {
          fieldApi.handleChange(next?.value ?? "");
        }}
      >
        <ComboboxInput
          placeholder={field.placeholder}
          aria-invalid={hasError || undefined}
          className={cn("w-full min-w-0", selectClassName)}
          onBlur={fieldApi.handleBlur}
        />
        <ComboboxContent>
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
