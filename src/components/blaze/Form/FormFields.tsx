import type { AnyFieldApi } from "@tanstack/react-form";

import { DateField } from "./DateField";
import { FileUploadField } from "./FileUploadField";
import { NumberField } from "./NumberField";
import { RichTextareaField } from "./RichTextareaField";
import { SelectField } from "./SelectField";
import { SelectMultipleField } from "./SelectMultipleField";
import { SwitchField } from "./SwitchField";
import { TextareaField } from "./TextareaField";
import { TextField } from "./TextField";
import type { FormField } from "./types";

interface FormFieldsProps {
  fields: FormField[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}

function renderField(field: FormField, fieldApi: AnyFieldApi) {
  const shell = { label: field.label, placeholder: field.placeholder };

  switch (field.type) {
    case "date":
      return <DateField field={{ ...shell, inputProps: field.inputProps }} fieldApi={fieldApi} />;
    case "text":
      return <TextField field={{ ...shell, inputProps: field.inputProps }} fieldApi={fieldApi} />;
    case "number":
      return <NumberField field={{ ...shell, inputProps: field.inputProps }} fieldApi={fieldApi} />;
    case "textarea":
      return <TextareaField field={{ ...shell, inputProps: field.inputProps }} fieldApi={fieldApi} />;
    case "richTextarea":
      return <RichTextareaField field={{ ...shell, inputProps: field.inputProps }} fieldApi={fieldApi} />;
    case "select":
      return <SelectField field={{ ...shell, inputProps: field.inputProps }} fieldApi={fieldApi} />;
    case "selectMultiple":
      return <SelectMultipleField field={{ ...shell, inputProps: field.inputProps }} fieldApi={fieldApi} />;
    case "fileUpload":
      return <FileUploadField field={{ ...shell, inputProps: field.inputProps }} fieldApi={fieldApi} />;
    case "switch":
      return <SwitchField field={{ ...shell, inputProps: field.inputProps }} fieldApi={fieldApi} />;
    default:
      return null;
  }
}

export const FormFields = ({ fields, form }: FormFieldsProps) => {
  return (
    <>
      {fields.map((field) => (
        <form.Field
          name={field.name}
          key={field.name}
          validators={{
            onBlur: field.validator,
            onSubmit: field.validator,
          }}
        >
          {(fieldApi: AnyFieldApi) => renderField(field, fieldApi)}
        </form.Field>
      ))}
    </>
  );
};
