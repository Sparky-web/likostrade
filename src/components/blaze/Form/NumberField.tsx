import type { AnyFieldApi } from "@tanstack/react-form";
import { type ComponentProps, useId } from "react";

import { cn, Input } from "~/components";

import { FormFieldWrap } from "./FormFieldWrap";
import type { FormFieldBaseForComponents } from "./types";
import { ERROR_CLASS_NAMES } from "./utils";

/** Доп. атрибуты `input[type=number]` (`value`/`onChange`/тип задаёт поле формы). */
export type NumberFieldInputProps = Omit<ComponentProps<"input">, "onChange" | "onBlur" | "value" | "id" | "type">;

interface NumberFieldProps {
  field: FormFieldBaseForComponents & { inputProps?: NumberFieldInputProps };
  fieldApi: AnyFieldApi;
}

const toDisplayValue = (value: unknown): string => {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") {
    const t = value.trim();
    if (t === "") return "";
    const n = Number(t);
    return Number.isFinite(n) ? String(n) : "";
  }
  return "";
};

export const NumberField = ({ field, fieldApi }: NumberFieldProps) => {
  const fallbackId = useId();
  const id = field.id ?? fallbackId;
  const hasError = fieldApi.state.meta.errors.length > 0;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- число может прийти строкой после загрузки
  const stored = fieldApi.state.value;

  return (
    <FormFieldWrap label={field.label} fieldApi={fieldApi} id={id}>
      <Input
        id={id}
        type="number"
        placeholder={field.placeholder}
        onChange={(e) => {
          const s = e.target.value;
          if (s === "") {
            fieldApi.handleChange(null);
            return;
          }
          const n = Number(s);
          fieldApi.handleChange(Number.isFinite(n) ? n : null);
        }}
        onBlur={fieldApi.handleBlur}
        value={toDisplayValue(stored)}
        className={cn(field.inputProps?.className, hasError && ERROR_CLASS_NAMES)}
        {...field.inputProps}
      />
    </FormFieldWrap>
  );
};
