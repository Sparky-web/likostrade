import type { AnyFieldApi } from "@tanstack/react-form";
import { type ComponentProps, useId } from "react";

import { cn, Input } from "~/components";

import { FormFieldWrap } from "./FormFieldWrap";
import type { FormFieldBaseForComponents } from "./types";
import { ERROR_CLASS_NAMES } from "./utils";

/** Доп. атрибуты нативного `input` (value/onChange задаёт форма). */
export type TextFieldInputProps = Omit<ComponentProps<"input">, "onChange" | "onBlur" | "value" | "id">;

interface TextFieldProps {
  field: FormFieldBaseForComponents & { inputProps?: TextFieldInputProps };
  fieldApi: AnyFieldApi;
}

export const TextField = ({ field, fieldApi }: TextFieldProps) => {
  const fallbackId = useId();
  const id = field.id ?? fallbackId;
  const hasError = fieldApi.state.meta.errors.length > 0;

  return (
    <FormFieldWrap label={field.label} fieldApi={fieldApi} id={id}>
      <Input
        id={id}
        type="text"
        placeholder={field.placeholder}
        onChange={(e) => fieldApi.handleChange(e.target.value)}
        onBlur={fieldApi.handleBlur}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value={fieldApi.state.value}
        className={cn(field.inputProps?.className, hasError && ERROR_CLASS_NAMES)}
        {...field.inputProps}
      />
    </FormFieldWrap>
  );
};
