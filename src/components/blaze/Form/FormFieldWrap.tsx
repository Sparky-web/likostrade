import type { AnyFieldApi } from "@tanstack/react-form";
import type { ReactNode } from "react";

import { Field, FieldContent, FieldError, FieldLabel } from "~/components";

interface FormFieldWrapProps {
  label: string;
  fieldApi: AnyFieldApi;
  id: string;
  children: ReactNode;
}

/** Оболочка поля формы: лейбл + содержимое + список ошибок (без дублей). */
export const FormFieldWrap = ({ label, fieldApi, id, children }: FormFieldWrapProps) => {
  const errors = [...new Set(fieldApi.state.meta.errors.map((error: { message: string }) => error.message))];

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldContent>
        {children}
        {errors.map((error, index) => (
          <FieldError key={index}>{error}</FieldError>
        ))}
      </FieldContent>
    </Field>
  );
};
