"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import type { ComponentProps } from "react";
import { useId } from "react";

import { Field, FieldContent, FieldError, FieldLabel, Switch } from "~/components";

import type { FormFieldBaseForComponents } from "./types";

/** Доп. атрибуты переключателя (checked/onCheckedChange задаёт форма). */
export type SwitchFieldInputProps = Omit<
  ComponentProps<typeof Switch>,
  "checked" | "onCheckedChange" | "onBlur" | "id"
>;

interface SwitchFieldProps {
  field: FormFieldBaseForComponents & { inputProps?: SwitchFieldInputProps };
  fieldApi: AnyFieldApi;
}

export const SwitchField = ({ field, fieldApi }: SwitchFieldProps) => {
  const fallbackId = useId();
  const id = field.id ?? fallbackId;
  const errors = [...new Set(fieldApi.state.meta.errors.map((error: { message: string }) => error.message))];

  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
      <FieldContent>
        <Switch
          id={id}
          checked={Boolean(fieldApi.state.value)}
          onCheckedChange={(checked) => fieldApi.handleChange(checked)}
          onBlur={fieldApi.handleBlur}
          {...field.inputProps}
        />
        {errors.map((error, index) => (
          <FieldError key={index}>{error}</FieldError>
        ))}
      </FieldContent>
    </Field>
  );
};
