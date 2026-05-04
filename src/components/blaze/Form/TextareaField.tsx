import type { AnyFieldApi } from "@tanstack/react-form";
import { type ComponentProps, useId } from "react";

import { cn, Textarea } from "~/components";

import { FormFieldWrap } from "./FormFieldWrap";
import type { FormFieldBaseForComponents } from "./types";
import { ERROR_CLASS_NAMES } from "./utils";

/** Доп. атрибуты нативного `textarea` (value/onChange задаёт форма). */
export type TextareaFieldInputProps = Omit<ComponentProps<"textarea">, "onChange" | "onBlur" | "value" | "id">;

interface TextareaFieldProps {
  field: FormFieldBaseForComponents & { inputProps?: TextareaFieldInputProps };
  fieldApi: AnyFieldApi;
}

export const TextareaField = ({ field, fieldApi }: TextareaFieldProps) => {
  const fallbackId = useId();
  const id = field.id ?? fallbackId;
  const hasError = fieldApi.state.meta.errors.length > 0;

  return (
    <FormFieldWrap label={field.label} fieldApi={fieldApi} id={id}>
      <Textarea
        {...field.inputProps}
        id={id}
        placeholder={field.placeholder}
        onChange={(e) => fieldApi.handleChange(e.target.value)}
        onBlur={fieldApi.handleBlur}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value={fieldApi.state.value}
        className={cn(field.inputProps?.className, hasError && ERROR_CLASS_NAMES)}
      />
    </FormFieldWrap>
  );
};
