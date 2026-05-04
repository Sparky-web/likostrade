import type { ZodSchema } from "zod";

import type { DateFieldInputProps } from "./DateField";
import type { FileUploadFieldInputProps } from "./FileUploadField";
import type { NumberFieldInputProps } from "./NumberField";
import type { RichTextareaFieldInputProps } from "./RichTextareaField";
import type { SelectFieldInputProps } from "./SelectField";
import type { SelectMultipleFieldInputProps } from "./SelectMultipleField";
import type { SwitchFieldInputProps } from "./SwitchField";
import type { TextareaFieldInputProps } from "./TextareaField";
import type { TextFieldInputProps } from "./TextField";

export type FormFieldBase = {
  name: string;
  label: string;
  placeholder?: string;
  validator?: ZodSchema;
  defaultValue?: unknown;
};

/** Оболочка поля для виджетов ввода: только то, что нужно для отображения. */
export type FormFieldBaseForComponents = {
  label: string;
  id?: string;
  placeholder?: string;
};

export type FormField =
  | (FormFieldBase & { type: "date"; inputProps?: DateFieldInputProps })
  | (FormFieldBase & { type: "text"; inputProps?: TextFieldInputProps })
  | (FormFieldBase & { type: "number"; inputProps?: NumberFieldInputProps })
  | (FormFieldBase & { type: "textarea"; inputProps?: TextareaFieldInputProps })
  | (FormFieldBase & { type: "richTextarea"; inputProps?: RichTextareaFieldInputProps })
  | (FormFieldBase & { type: "select"; inputProps?: SelectFieldInputProps })
  | (FormFieldBase & { type: "selectMultiple"; inputProps?: SelectMultipleFieldInputProps })
  | (FormFieldBase & { type: "fileUpload"; inputProps?: FileUploadFieldInputProps })
  | (FormFieldBase & { type: "switch"; inputProps?: SwitchFieldInputProps });
