"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { type ComponentProps, useId } from "react";

import { cn, Input } from "~/components";

import { FormFieldWrap } from "./FormFieldWrap";
import type { FormFieldBaseForComponents } from "./types";
import { ERROR_CLASS_NAMES } from "./utils";

/** Нативный input[type=date]: в форме хранится строка YYYY-MM-DD. */
export type DateFieldInputProps = Omit<ComponentProps<"input">, "onChange" | "onBlur" | "value" | "id" | "type">;

interface DateFieldProps {
  field: FormFieldBaseForComponents & { inputProps?: DateFieldInputProps };
  fieldApi: AnyFieldApi;
}

export const DateField = ({ field, fieldApi }: DateFieldProps) => {
  const fallbackId = useId();
  const id = field.id ?? fallbackId;
  const hasError = fieldApi.state.meta.errors.length > 0;
  const value = typeof fieldApi.state.value === "string" ? fieldApi.state.value : "";

  return (
    <FormFieldWrap label={field.label} fieldApi={fieldApi} id={id}>
      <Input
        id={id}
        type="date"
        placeholder={field.placeholder}
        onChange={(e) => fieldApi.handleChange(e.target.value)}
        onBlur={fieldApi.handleBlur}
        value={value}
        className={cn(field.inputProps?.className, hasError && ERROR_CLASS_NAMES)}
        {...field.inputProps}
      />
    </FormFieldWrap>
  );
};
