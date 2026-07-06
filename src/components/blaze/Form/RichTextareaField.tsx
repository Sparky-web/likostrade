"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import type { Content } from "@tiptap/react";
import dynamic from "next/dynamic";
import { useId } from "react";

import type { RichEditorProps } from "~/components/blaze/RichEditor/RichEditor";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/components/utils/cn";

import { FormFieldWrap } from "./FormFieldWrap";
import type { FormFieldBaseForComponents } from "./types";
import { ERROR_CLASS_NAMES } from "./utils";

// TipTap с подсветкой кода тяжёлый и нужен только в админке — отдельный чанк по требованию,
// иначе он попадает в First Load каждой публичной страницы через баррель полей формы
const RichEditor = dynamic(() => import("~/components/blaze/RichEditor/RichEditor"), {
  ssr: false,
  loading: () => <Skeleton className="h-40 w-full" />,
});

/** Пропсы RichEditor без привязки к форме (`value`/`onChange` задаёт поле). */
export type RichTextareaFieldInputProps = Omit<RichEditorProps, "value" | "onChange">;

interface RichTextareaFieldProps {
  field: FormFieldBaseForComponents & { inputProps?: RichTextareaFieldInputProps };
  fieldApi: AnyFieldApi;
}

/** Преобразует вывод редактора в строку состояния формы (при output json — сериализованный JSON). */
const contentToFormValue = (content: Content): string => {
  if (typeof content === "string") return content;
  return JSON.stringify(content);
};

export const RichTextareaField = ({ field, fieldApi }: RichTextareaFieldProps) => {
  const fallbackId = useId();
  const id = field.id ?? fallbackId;
  const hasError = fieldApi.state.meta.errors.length > 0;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- см. другие поля формы с AnyFieldApi
  const rawValue = fieldApi.state.value;

  return (
    <FormFieldWrap label={field.label} fieldApi={fieldApi} id={id}>
      <RichEditor
        {...field.inputProps}
        output={"html"}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- см. другие поля формы с AnyFieldApi
        value={rawValue}
        onChange={(content) => {
          fieldApi.handleChange(contentToFormValue(content));
        }}
        onBlur={() => {
          void fieldApi.handleBlur();
        }}
        placeholder={field.placeholder}
        className={cn(hasError && ERROR_CLASS_NAMES)}
      />
    </FormFieldWrap>
  );
};
