"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type AnyFormApi, type ReactFormApi } from "@tanstack/react-form";

import { Button, VStack } from "~/components";

// AnyFormApi из form-core не содержит React-расширений (Subscribe/Field).
// Поэтому добавляем ReactFormApi с any-параметрами — компонент работает с любой формой.
type AnyReactFormApi = AnyFormApi & ReactFormApi<any, any, any, any, any, any, any, any, any, any, any, any>;

// Pick изолирует контравариантные методы (pushFieldValue и т.п.), которые иначе
// блокировали бы передачу формы конкретного типа в место, ожидающее AnyReactFormApi.
type CrudTableFormButtonForm = Pick<AnyReactFormApi, "Subscribe" | "handleSubmit">;

type CrudTableFormButtonProps = {
  // Любая форма tanstack-form: компонент сам подпишется на isSubmitting/canSubmit
  form: CrudTableFormButtonForm;
  label: string;
};

// Узкий срез состояния формы, которым реально пользуется кнопка.
// Изолируем any из AnyFormApi прямо в селекторе, чтобы дальше типы были чистыми.
type FormButtonState = {
  isSubmitting: boolean;
  canSubmit: boolean;
};

export const CrudTableFormButton = ({ form, label }: CrudTableFormButtonProps) => {
  return (
    <form.Subscribe
      selector={(state): FormButtonState => ({
        isSubmitting: Boolean((state as FormButtonState).isSubmitting),
        canSubmit: Boolean((state as FormButtonState).canSubmit),
      })}
    >
      {({ isSubmitting, canSubmit }: FormButtonState) => (
        <VStack>
          <Button onClick={() => form.handleSubmit()} isLoading={isSubmitting} disabled={!canSubmit}>
            {label}
          </Button>
        </VStack>
      )}
    </form.Subscribe>
  );
};
