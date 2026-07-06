"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { isWithinMaxUploadFileSize, MAX_UPLOAD_FILE_SIZE_MB, typo } from "lib";
import { Loader2, Paperclip, Upload, X } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useCallback, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { HStack, VStack } from "~/components";
import { Button } from "~/components/ui/button";
import { cn } from "~/components/utils/cn";
import { api } from "~/trpc/react";

import { FormFieldWrap } from "./FormFieldWrap";
import type { FormFieldBaseForComponents } from "./types";

/** Доп. настройки загрузчика файлов (множественность, accept, лимит). */
export type FileUploadFieldInputProps = { isMultiple: boolean; accept?: string; max?: number };

// Определение типов для компонента
type FileData = {
  url: string;
  filename: string;
};

type MultipleFilesProps = {
  files: string[];
  setFiles: React.Dispatch<React.SetStateAction<string[]>>;
  isMultiple: true;
  accept?: string;
  max?: number;
};

type SingleFileProps = {
  file?: string;
  setFile: React.Dispatch<React.SetStateAction<string | undefined>>;
  isMultiple: false;
  accept?: string;
};

export type DragDropFilesProps = (MultipleFilesProps | SingleFileProps) & {
  /** Ошибка валидации поля формы — рамка в тон `destructive`. */
  hasError?: boolean;
};

/** Загрузчик без привязки к форме: `files`/`setFiles` управляет вызывающий (например, редактор секций). */
export function FileUploader(props: DragDropFilesProps) {
  const { isMultiple, accept, hasError } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});

  const { mutateAsync: upload } = api.fileUploaderRouter.upload.useMutation();

  const getCurrentFilesCount = useCallback(() => {
    if (isMultiple) {
      return props.files?.length ?? 0;
    }
    return props.file ? 1 : 0;
  }, [isMultiple, props]);

  const maxFiles = isMultiple ? props.max : undefined;

  // Обработчик для перетаскивания файлов
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // Преобразование файла в base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (!e.target?.result) {
          return reject(new Error("Failed to read file"));
        }

        if (typeof e.target.result === "string") {
          // Проверяем, есть ли запятая в результате
          const parts = e.target.result.split(",");

          if (parts.length > 1 && parts[1]) {
            // Убираем data URL prefix (mime type) и оставляем только base64
            resolve(parts[1]);
          } else if (parts.length === 1 && parts[0]) {
            // Если нет запятой, значит весь результат - это base64
            resolve(parts[0]);
          } else {
            return reject(new Error("Failed to extract base64 data"));
          }
        } else {
          reject(new Error("Unexpected file reader result type"));
        }
      };

      reader.onerror = () => {
        reject(new Error("File reading error"));
      };

      reader.readAsDataURL(file);
    });
  };

  // Обработка загрузки файла
  const processFile = useCallback(
    async (file: File) => {
      const tempId = `temp_${Date.now()}_${file.name}`;

      if (
        (isMultiple && typeof maxFiles === "number" && getCurrentFilesCount() >= maxFiles) ||
        (!isMultiple && getCurrentFilesCount() >= 1)
      ) {
        toast.error(typo(`Превышено максимальное количество файлов`));
        return;
      }

      if (!isWithinMaxUploadFileSize(file.size)) {
        toast.error(typo(`Максимальный размер файла — ${MAX_UPLOAD_FILE_SIZE_MB} МБ`));
        return;
      }

      // Устанавливаем состояние загрузки
      setLoadingFiles((prev) => ({ ...prev, [tempId]: true }));

      try {
        // Конвертируем файл в base64
        const base64 = await fileToBase64(file);

        // Отправляем файл на сервер
        const result = await upload({
          file: base64,
          filename: file.name,
        });

        // Обновляем состояние в зависимости от режима (одиночный/множественный)
        if (isMultiple) {
          const multipleProps = props;
          const maxLimit = multipleProps.max;
          multipleProps.setFiles((prevState) => {
            const current = prevState || [];
            if (typeof maxLimit === "number" && current.length >= maxLimit) {
              toast.error(typo(`Превышено максимальное количество файлов`));
              return current;
            }

            const next = [...current, result.id];
            if (typeof maxLimit === "number" && next.length > maxLimit) {
              toast.error(typo(`Превышено максимальное количество файлов`));
              return current;
            }

            return next;
          });
        } else {
          const singleProps = props;
          singleProps.setFile(result.id);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(typo(`Не удалось загрузить файл`));
      } finally {
        // Убираем состояние загрузки
        setLoadingFiles((prev) => {
          const newState = { ...prev };
          delete newState[tempId];
          return newState;
        });
      }
    },
    [getCurrentFilesCount, isMultiple, maxFiles, props, upload],
  );

  // Обработчик для перетаскивания файлов
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length === 0) {
        return;
      }

      let filesToProcess = droppedFiles;

      if (isMultiple) {
        const availableSlots = typeof maxFiles === "number" ? Math.max(maxFiles - getCurrentFilesCount(), 0) : undefined;

        if (availableSlots !== undefined && availableSlots <= 0) {
          toast.error(typo(`Превышено максимальное количество файлов`));
          return;
        }

        if (availableSlots !== undefined && droppedFiles.length > availableSlots) {
          filesToProcess = droppedFiles.slice(0, availableSlots);
          toast.error(typo(`Превышено максимальное количество файлов`));
        }
      } else {
        filesToProcess = droppedFiles.slice(0, 1);
      }

      for (const file of filesToProcess) {
        await processFile(file);
      }
    },
    [getCurrentFilesCount, isMultiple, maxFiles, processFile],
  );

  // Обработчик выбора файлов через диалог
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      let selectedFiles = Array.from(e.target.files);

      if (!selectedFiles[0]) return;

      if (isMultiple) {
        const availableSlots = typeof maxFiles === "number" ? Math.max(maxFiles - getCurrentFilesCount(), 0) : undefined;

        if (availableSlots !== undefined && availableSlots <= 0) {
          toast.error(typo(`Превышено максимальное количество файлов`));
          e.target.value = "";
          return;
        }

        if (availableSlots !== undefined && selectedFiles.length > availableSlots) {
          selectedFiles = selectedFiles.slice(0, availableSlots);
          toast.error(typo(`Превышено максимальное количество файлов`));
        }

        for (const file of selectedFiles) {
          await processFile(file);
        }
      } else {
        await processFile(selectedFiles[0]);
      }

      // Сбрасываем значение input, чтобы можно было загрузить тот же файл повторно
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Удаление файла
  const removeFile = (url: string) => {
    if (isMultiple) {
      const multipleProps = props;
      multipleProps.setFiles((prev) => (prev || []).filter((file) => file !== url));
    } else {
      const singleProps = props;
      singleProps.setFile(undefined);
    }
  };

  const currentFiles: FileData[] = isMultiple
    ? (props.files || []).map((url) => ({
        url,
        filename: url,
      }))
    : props.file
      ? [
          {
            url: props.file,
            filename: props.file,
          },
        ]
      : [];

  const currentCount = currentFiles.length;

  const isButtonDisabled =
    (isMultiple && typeof maxFiles === "number" && currentCount >= maxFiles) || (!isMultiple && currentCount >= 1);

  const isDropDisabled = isButtonDisabled;

  return (
    <VStack className="w-full" gap="sm">
      <VStack
        gap="md"
        justify="center"
        align="center"
        className={cn(
          "bg-input/30 text-card-foreground w-full rounded-lg border-2 border-dashed p-4 transition-colors",
          hasError
            ? cn("border-destructive bg-destructive/5", isDragging && "bg-destructive/10")
            : isDragging
              ? "border-primary bg-primary/5"
              : "border-border",
        )}
        onDragOver={
          isDropDisabled
            ? (event) => {
                event.preventDefault();
                event.stopPropagation();
              }
            : handleDragOver
        }
        onDragLeave={handleDragLeave}
        onDrop={
          isDropDisabled
            ? (event) => {
                event.preventDefault();
                event.stopPropagation();
              }
            : handleDrop
        }
      >
        <HStack gap="md" justify="center" align="center" className="flex-wrap">
          <Button
            type="button"
            variant="outline"
            className={cn("flex h-10 items-center gap-2 rounded-md px-5", isButtonDisabled && "cursor-not-allowed")}
            disabled={isButtonDisabled}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 min-w-4 shrink-0" />
            <span>{typo("Загрузить")}</span>
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple={isMultiple}
            accept={accept}
          />
          <span className="text-muted-foreground text-sm">{typo("Перетащите файлы сюда или нажмите кнопку для выбора")}</span>
        </HStack>
      </VStack>

      {currentFiles?.length > 0 && (
        <HStack gap="sm" className="flex-wrap">
          {currentFiles.map((file) => (
            <Link href={`/uploads/${file.url}`} target="_blank" key={file.url}>
              <HStack gap="xs" align="center" className="border-border bg-card text-foreground rounded-full border px-3 py-2">
                <Paperclip className="text-muted-foreground size-4 shrink-0" />
                <span className="text-xs">{file.filename}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFile(file.url);
                  }}
                  className="text-muted-foreground hover:text-foreground ml-1 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </HStack>
            </Link>
          ))}
        </HStack>
      )}
      {Object.keys(loadingFiles).length > 0 && (
        <HStack gap="sm" className="flex-wrap">
          {Object.keys(loadingFiles).map((tempKey) => (
            <HStack
              key={tempKey}
              gap="xs"
              align="center"
              className="border-border bg-muted/50 text-foreground rounded-full border px-4 py-2"
            >
              <Loader2 className="text-primary size-4 shrink-0 animate-spin" />
              <span className="text-sm">{typo("Загрузка...")}</span>
            </HStack>
          ))}
        </HStack>
      )}
      {isMultiple && typeof maxFiles === "number" && (
        <div className="text-muted-foreground text-sm">
          {currentCount}/{maxFiles}
        </div>
      )}
    </VStack>
  );
}

interface FileUploadFieldProps {
  field: FormFieldBaseForComponents & { inputProps?: FileUploadFieldInputProps };
  fieldApi: AnyFieldApi;
}

export const FileUploadField = ({ field, fieldApi }: FileUploadFieldProps) => {
  const fallbackId = useId();
  const id = field.id ?? fallbackId;
  const hasError = fieldApi.state.meta.errors.length > 0;

  return (
    <FormFieldWrap label={field.label} fieldApi={fieldApi} id={id}>
      <FileUploader
        {...(field.inputProps?.isMultiple
          ? {
              isMultiple: true,

              files: fieldApi.state.value as string[],
              setFiles: (files) => {
                fieldApi.handleChange(files);
                fieldApi.handleBlur();
              },
              max: field.inputProps?.max,
            }
          : {
              isMultiple: false,
              file: fieldApi.state.value as string | undefined,
              setFile: (file) => {
                fieldApi.handleChange(file);
                fieldApi.handleBlur();
              },
            })}
        accept={field.inputProps?.accept}
        hasError={hasError}
      />
    </FormFieldWrap>
  );
};
