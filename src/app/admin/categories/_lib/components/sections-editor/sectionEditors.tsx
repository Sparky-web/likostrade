"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { typo, zodRussian } from "lib";
import { Plus, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import {
  Button,
  Card,
  CardContent,
  FileUploader,
  HStack,
  Input,
  RichTextareaField,
  SelectField,
  type SelectFieldOption,
  Text,
  TextareaField,
  TextField,
  VStack,
} from "~/components";
import type { CardsSection } from "~/sections/schema";
import { CARD_ICON_KEYS, SPECIAL_BLOCKS, stripUploadPrefix, VIDEO_EMBED_HOSTS, videoUrlSchema } from "~/sections/schema";

import { CARD_ICON_LABELS } from "./cardIconLabels";

/**
 * Пропсы редактора одного типа секции: форма и путь к секции в состоянии
 * (`sections[i]`). Тип формы — any по конвенции проекта (см. FormFields).
 */
export type SectionEditorProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  namePrefix: string;
};

export const TextSectionEditor = ({ form, namePrefix }: SectionEditorProps) => (
  <form.Field name={`${namePrefix}.html`}>
    {(field: AnyFieldApi) => <RichTextareaField fieldApi={field} field={{ label: typo("Текст") }} />}
  </form.Field>
);

export const VideoSectionEditor = ({ form, namePrefix }: SectionEditorProps) => (
  <VStack gap="2xs">
    <form.Field name={`${namePrefix}.url`} validators={{ onBlur: videoUrlSchema, onSubmit: videoUrlSchema }}>
      {(field: AnyFieldApi) => (
        <TextField
          fieldApi={field}
          field={{ label: typo("Ссылка на встраиваемое видео"), placeholder: "https://vkvideo.ru/video_ext.php?…" }}
        />
      )}
    </form.Field>
    <Text variant="small" color="supplementary">
      {typo(`Разрешены embed-ссылки: ${VIDEO_EMBED_HOSTS.join(", ")}`)}
    </Text>
  </VStack>
);

const specialBlockOptions: SelectFieldOption[] = Object.entries(SPECIAL_BLOCKS).map(([value, label]) => ({
  value,
  label,
}));

export const SpecialSectionEditor = ({ form, namePrefix }: SectionEditorProps) => (
  <form.Field name={`${namePrefix}.block`}>
    {(field: AnyFieldApi) => (
      <SelectField fieldApi={field} field={{ label: typo("Блок"), inputProps: { options: specialBlockOptions } }} />
    )}
  </form.Field>
);

type FileItem = { fileId: string; [key: string]: unknown };

/**
 * Общий редактор секций с файлами (files/gallery): загрузчик + подпись на каждый элемент.
 * FileUploader оперирует string[] — адаптер сохраняет прочие поля элемента по fileId.
 */
const FileItemsSectionEditor = ({
  form,
  namePrefix,
  accept,
  itemTextField,
  itemTextLabel,
  itemTextPlaceholder,
}: SectionEditorProps & {
  accept?: string;
  itemTextField: "label" | "alt";
  itemTextLabel: string;
  itemTextPlaceholder: string;
}) => (
  <form.Field name={`${namePrefix}.items`}>
    {(field: AnyFieldApi) => {
      const items = (field.state.value ?? []) as FileItem[];

      const setFiles: Dispatch<SetStateAction<string[]>> = (action) => {
        const currentIds = items.map((item) => item.fileId);
        const nextIds = typeof action === "function" ? action(currentIds) : action;
        field.handleChange(nextIds.map((fileId) => items.find((item) => item.fileId === fileId) ?? { fileId }));
      };

      return (
        <VStack gap="md">
          <FileUploader isMultiple accept={accept} files={items.map((item) => item.fileId)} setFiles={setFiles} />
          {items.map((item, index) => (
            <form.Field key={item.fileId} name={`${namePrefix}.items[${index}].${itemTextField}`}>
              {(textField: AnyFieldApi) => (
                <TextField
                  fieldApi={textField}
                  field={{
                    label: typo(`${itemTextLabel}: ${stripUploadPrefix(item.fileId)}`),
                    placeholder: itemTextPlaceholder,
                  }}
                />
              )}
            </form.Field>
          ))}
        </VStack>
      );
    }}
  </form.Field>
);

export const GallerySectionEditor = (props: SectionEditorProps) => (
  <FileItemsSectionEditor
    {...props}
    accept="image/*"
    itemTextField="alt"
    itemTextLabel={typo("Описание фото")}
    itemTextPlaceholder={typo("Альтернативный текст")}
  />
);

export const FilesSectionEditor = (props: SectionEditorProps) => (
  <FileItemsSectionEditor
    {...props}
    itemTextField="label"
    itemTextLabel={typo("Подпись")}
    itemTextPlaceholder={typo("Имя файла по умолчанию")}
  />
);

const cardIconOptions: SelectFieldOption[] = [
  { value: "", label: typo("Без иконки") },
  ...CARD_ICON_KEYS.map((key) => ({ value: key, label: CARD_ICON_LABELS[key] })),
];

const cardTitleSchema = zodRussian.string().min(1);

export const CardsSectionEditor = ({ form, namePrefix }: SectionEditorProps) => (
  <form.Field name={`${namePrefix}.items`} mode="array">
    {(itemsField: AnyFieldApi) => {
      const items = (itemsField.state.value ?? []) as CardsSection["items"];
      return (
        <VStack gap="md">
          {items.map((_, index) => (
            <Card key={index} size="sm">
              <CardContent>
                <VStack gap="md">
                  <HStack align="center" justify="between">
                    <Text variant="small" color="supplementary">
                      {typo(`Карточка ${index + 1}`)}
                    </Text>
                    <Button type="button" variant="ghost" size="icon" onClick={() => itemsField.removeValue(index)}>
                      <X className="size-4" />
                    </Button>
                  </HStack>
                  <form.Field name={`${namePrefix}.items[${index}].icon`}>
                    {(field: AnyFieldApi) => (
                      <SelectField
                        fieldApi={field}
                        field={{ label: typo("Иконка"), inputProps: { options: cardIconOptions } }}
                      />
                    )}
                  </form.Field>
                  <form.Field
                    name={`${namePrefix}.items[${index}].title`}
                    validators={{ onBlur: cardTitleSchema, onSubmit: cardTitleSchema }}
                  >
                    {(field: AnyFieldApi) => <TextField fieldApi={field} field={{ label: typo("Заголовок") }} />}
                  </form.Field>
                  <form.Field name={`${namePrefix}.items[${index}].text`}>
                    {(field: AnyFieldApi) => <TextareaField fieldApi={field} field={{ label: typo("Текст") }} />}
                  </form.Field>
                </VStack>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={() => itemsField.pushValue({ title: "" })}>
            <Plus className="size-4" />
            {typo("Добавить карточку")}
          </Button>
        </VStack>
      );
    }}
  </form.Field>
);

const imagePositionOptions: SelectFieldOption[] = [
  { value: "right", label: typo("Справа") },
  { value: "left", label: typo("Слева") },
];

/** Текст + изображение: rich-текст, одиночная картинка, сторона на десктопе. */
export const MediaTextSectionEditor = ({ form, namePrefix }: SectionEditorProps) => (
  <VStack gap="md">
    <form.Field name={`${namePrefix}.html`}>
      {(field: AnyFieldApi) => <RichTextareaField fieldApi={field} field={{ label: typo("Текст") }} />}
    </form.Field>
    <form.Field name={`${namePrefix}.imageId`}>
      {(field: AnyFieldApi) => {
        const imageId = (field.state.value as string | undefined) || undefined;
        const setFile: Dispatch<SetStateAction<string | undefined>> = (action) => {
          const next = typeof action === "function" ? action(imageId) : action;
          field.handleChange(next ?? "");
        };
        return <FileUploader isMultiple={false} accept="image/*" file={imageId} setFile={setFile} />;
      }}
    </form.Field>
    <form.Field name={`${namePrefix}.imagePosition`}>
      {(field: AnyFieldApi) => (
        <SelectField
          fieldApi={field}
          field={{ label: typo("Сторона изображения"), inputProps: { options: imagePositionOptions } }}
        />
      )}
    </form.Field>
  </VStack>
);

const stepTitleSchema = zodRussian.string().min(1);

/** Этапы/процесс: нумерованный список шагов (заголовок + описание). */
export const StepsSectionEditor = ({ form, namePrefix }: SectionEditorProps) => (
  <form.Field name={`${namePrefix}.items`} mode="array">
    {(itemsField: AnyFieldApi) => {
      const items = (itemsField.state.value ?? []) as { title: string; text?: string }[];
      return (
        <VStack gap="md">
          {items.map((_, index) => (
            <Card key={index} size="sm">
              <CardContent>
                <VStack gap="md">
                  <HStack align="center" justify="between">
                    <Text variant="small" color="supplementary">
                      {typo(`Шаг ${index + 1}`)}
                    </Text>
                    <Button type="button" variant="ghost" size="icon" onClick={() => itemsField.removeValue(index)}>
                      <X className="size-4" />
                    </Button>
                  </HStack>
                  <form.Field
                    name={`${namePrefix}.items[${index}].title`}
                    validators={{ onBlur: stepTitleSchema, onSubmit: stepTitleSchema }}
                  >
                    {(field: AnyFieldApi) => <TextField fieldApi={field} field={{ label: typo("Заголовок шага") }} />}
                  </form.Field>
                  <form.Field name={`${namePrefix}.items[${index}].text`}>
                    {(field: AnyFieldApi) => <TextareaField fieldApi={field} field={{ label: typo("Описание") }} />}
                  </form.Field>
                </VStack>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={() => itemsField.pushValue({ title: "" })}>
            <Plus className="size-4" />
            {typo("Добавить шаг")}
          </Button>
        </VStack>
      );
    }}
  </form.Field>
);

const statValueSchema = zodRussian.string().min(1);

/** Показатели: крупное значение + подпись. */
export const StatsSectionEditor = ({ form, namePrefix }: SectionEditorProps) => (
  <form.Field name={`${namePrefix}.items`} mode="array">
    {(itemsField: AnyFieldApi) => {
      const items = (itemsField.state.value ?? []) as { value: string; label?: string }[];
      return (
        <VStack gap="md">
          {items.map((_, index) => (
            <Card key={index} size="sm">
              <CardContent>
                <VStack gap="md">
                  <HStack align="center" justify="between">
                    <Text variant="small" color="supplementary">
                      {typo(`Показатель ${index + 1}`)}
                    </Text>
                    <Button type="button" variant="ghost" size="icon" onClick={() => itemsField.removeValue(index)}>
                      <X className="size-4" />
                    </Button>
                  </HStack>
                  <form.Field
                    name={`${namePrefix}.items[${index}].value`}
                    validators={{ onBlur: statValueSchema, onSubmit: statValueSchema }}
                  >
                    {(field: AnyFieldApi) => (
                      <TextField fieldApi={field} field={{ label: typo("Значение"), placeholder: typo("> 100 тонн") }} />
                    )}
                  </form.Field>
                  <form.Field name={`${namePrefix}.items[${index}].label`}>
                    {(field: AnyFieldApi) => (
                      <TextField
                        fieldApi={field}
                        field={{ label: typo("Подпись"), placeholder: typo("конструкций в месяц") }}
                      />
                    )}
                  </form.Field>
                </VStack>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={() => itemsField.pushValue({ value: "" })}>
            <Plus className="size-4" />
            {typo("Добавить показатель")}
          </Button>
        </VStack>
      );
    }}
  </form.Field>
);

const calloutVariantOptions: SelectFieldOption[] = [
  { value: "highlight", label: typo("Акцент (УТП/гарантия)") },
  { value: "quote", label: typo("Отзыв (с автором)") },
];

const calloutTextSchema = zodRussian.string().min(1);

/** Выделенная плашка: вариант, текст, автор (для отзыва). */
export const CalloutSectionEditor = ({ form, namePrefix }: SectionEditorProps) => (
  <VStack gap="md">
    <form.Field name={`${namePrefix}.variant`}>
      {(field: AnyFieldApi) => (
        <SelectField fieldApi={field} field={{ label: typo("Вариант"), inputProps: { options: calloutVariantOptions } }} />
      )}
    </form.Field>
    <form.Field name={`${namePrefix}.text`} validators={{ onBlur: calloutTextSchema, onSubmit: calloutTextSchema }}>
      {(field: AnyFieldApi) => <TextareaField fieldApi={field} field={{ label: typo("Текст") }} />}
    </form.Field>
    <form.Field name={`${namePrefix}.author`}>
      {(field: AnyFieldApi) => (
        <TextField
          fieldApi={field}
          field={{ label: typo("Автор (для отзыва)"), placeholder: typo("Имя, должность, компания") }}
        />
      )}
    </form.Field>
  </VStack>
);

const imageCardTitleSchema = zodRussian.string().min(1);

/** Карточки с фото: изображение + заголовок + описание на каждую (типы продукции, чертежи). */
export const ImageCardsSectionEditor = ({ form, namePrefix }: SectionEditorProps) => (
  <form.Field name={`${namePrefix}.items`} mode="array">
    {(itemsField: AnyFieldApi) => {
      const items = (itemsField.state.value ?? []) as { imageId: string; title: string; text?: string }[];
      return (
        <VStack gap="md">
          {items.map((_, index) => (
            <Card key={index} size="sm">
              <CardContent>
                <VStack gap="md">
                  <HStack align="center" justify="between">
                    <Text variant="small" color="supplementary">
                      {typo(`Карточка ${index + 1}`)}
                    </Text>
                    <Button type="button" variant="ghost" size="icon" onClick={() => itemsField.removeValue(index)}>
                      <X className="size-4" />
                    </Button>
                  </HStack>
                  <form.Field name={`${namePrefix}.items[${index}].imageId`}>
                    {(field: AnyFieldApi) => {
                      const imageId = (field.state.value as string | undefined) || undefined;
                      const setFile: Dispatch<SetStateAction<string | undefined>> = (action) => {
                        const next = typeof action === "function" ? action(imageId) : action;
                        field.handleChange(next ?? "");
                      };
                      return <FileUploader isMultiple={false} accept="image/*" file={imageId} setFile={setFile} />;
                    }}
                  </form.Field>
                  <form.Field
                    name={`${namePrefix}.items[${index}].title`}
                    validators={{ onBlur: imageCardTitleSchema, onSubmit: imageCardTitleSchema }}
                  >
                    {(field: AnyFieldApi) => <TextField fieldApi={field} field={{ label: typo("Заголовок") }} />}
                  </form.Field>
                  <form.Field name={`${namePrefix}.items[${index}].text`}>
                    {(field: AnyFieldApi) => <TextareaField fieldApi={field} field={{ label: typo("Текст") }} />}
                  </form.Field>
                </VStack>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="outline" onClick={() => itemsField.pushValue({ imageId: "", title: "" })}>
            <Plus className="size-4" />
            {typo("Добавить карточку")}
          </Button>
        </VStack>
      );
    }}
  </form.Field>
);

/** Ячейка таблицы: узкое поле без label. */
type CellInputProps = { form: SectionEditorProps["form"]; name: string; placeholder?: string };

const CellInput = ({ form, name, placeholder }: CellInputProps) => (
  <form.Field name={name}>
    {(field: AnyFieldApi) => (
      <Input
        value={(field.state.value as string | undefined) ?? ""}
        onChange={(event) => field.handleChange(event.target.value)}
        onBlur={field.handleBlur}
        placeholder={placeholder}
        className="min-w-32"
      />
    )}
  </form.Field>
);

export const TableSectionEditor = ({ form, namePrefix }: SectionEditorProps) => {
  /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- form: any (см. FormFields) */
  const getHeader = () => (form.getFieldValue(`${namePrefix}.headerRow`) ?? []) as string[];
  const getRows = () => (form.getFieldValue(`${namePrefix}.rows`) ?? []) as string[][];

  // Колоночные операции меняют шапку и все строки согласованно
  const addColumn = () => {
    form.setFieldValue(`${namePrefix}.headerRow`, [...getHeader(), ""]);
    form.setFieldValue(
      `${namePrefix}.rows`,
      getRows().map((row) => [...row, ""]),
    );
  };
  const removeColumn = (columnIndex: number) => {
    if (getHeader().length <= 1) return;
    form.setFieldValue(
      `${namePrefix}.headerRow`,
      getHeader().filter((_, index) => index !== columnIndex),
    );
    form.setFieldValue(
      `${namePrefix}.rows`,
      getRows().map((row) => row.filter((_, index) => index !== columnIndex)),
    );
  };
  const addRow = () => {
    form.setFieldValue(`${namePrefix}.rows`, [...getRows(), getHeader().map(() => "")]);
  };
  const removeRow = (rowIndex: number) => {
    form.setFieldValue(
      `${namePrefix}.rows`,
      getRows().filter((_, index) => index !== rowIndex),
    );
  };
  /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

  return (
    <form.Field name={`${namePrefix}.headerRow`} mode="array">
      {(headerField: AnyFieldApi) => (
        <form.Field name={`${namePrefix}.rows`} mode="array">
          {(rowsField: AnyFieldApi) => {
            const header = (headerField.state.value ?? []) as string[];
            const rows = (rowsField.state.value ?? []) as string[][];

            return (
              <VStack gap="sm">
                <div className="overflow-x-auto">
                  <VStack gap="xs" className="min-w-fit">
                    <HStack gap="xs" align="center">
                      {header.map((_, columnIndex) => (
                        <VStack key={columnIndex} gap="2xs" className="flex-1">
                          <CellInput
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- form: any (см. FormFields)
                            form={form}
                            name={`${namePrefix}.headerRow[${columnIndex}]`}
                            placeholder={typo(`Колонка ${columnIndex + 1}`)}
                          />
                        </VStack>
                      ))}
                      <div className="w-9 shrink-0" />
                    </HStack>
                    {rows.map((_, rowIndex) => (
                      <HStack key={rowIndex} gap="xs" align="center">
                        {header.map((__, columnIndex) => (
                          <div key={columnIndex} className="flex-1">
                            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- form: any (см. FormFields) */}
                            <CellInput form={form} name={`${namePrefix}.rows[${rowIndex}][${columnIndex}]`} />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeRow(rowIndex)}
                        >
                          <X className="size-4" />
                        </Button>
                      </HStack>
                    ))}
                  </VStack>
                </div>
                <HStack gap="sm" className="flex-wrap">
                  <Button type="button" variant="outline" size="sm" onClick={addRow}>
                    <Plus className="size-4" />
                    {typo("Строка")}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                    <Plus className="size-4" />
                    {typo("Колонка")}
                  </Button>
                  {header.length > 1 ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => removeColumn(header.length - 1)}>
                      <X className="size-4" />
                      {typo("Последняя колонка")}
                    </Button>
                  ) : null}
                </HStack>
              </VStack>
            );
          }}
        </form.Field>
      )}
    </form.Field>
  );
};
