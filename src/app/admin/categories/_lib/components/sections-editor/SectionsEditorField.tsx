"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { exhaustiveCheck, typo } from "lib";
import { Plus } from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Label,
  TextField,
  VStack,
} from "~/components";
import type { CategorySection } from "~/sections/schema";
import { SECTION_TYPE_LABELS, SPECIAL_BLOCKS } from "~/sections/schema";

import { SectionCardShell } from "./SectionCardShell";
import { makeSection } from "./sectionDefaults";
import {
  CardsSectionEditor,
  FilesSectionEditor,
  GallerySectionEditor,
  type SectionEditorProps,
  SpecialSectionEditor,
  TableSectionEditor,
  TextSectionEditor,
  VideoSectionEditor,
} from "./sectionEditors";

const sectionLabel = (section: CategorySection) =>
  section.type === "special"
    ? `${SECTION_TYPE_LABELS.special}: ${SPECIAL_BLOCKS[section.block]}`
    : SECTION_TYPE_LABELS[section.type];

function renderEditor(section: CategorySection, editorProps: SectionEditorProps) {
  switch (section.type) {
    case "text":
      return <TextSectionEditor {...editorProps} />;
    case "table":
      return <TableSectionEditor {...editorProps} />;
    case "files":
      return <FilesSectionEditor {...editorProps} />;
    case "video":
      return <VideoSectionEditor {...editorProps} />;
    case "gallery":
      return <GallerySectionEditor {...editorProps} />;
    case "cards":
      return <CardsSectionEditor {...editorProps} />;
    case "special":
      return <SpecialSectionEditor {...editorProps} />;
    default:
      return exhaustiveCheck(section);
  }
}

const SECTION_TYPES = Object.keys(SECTION_TYPE_LABELS) as CategorySection["type"][];

type SectionsEditorFieldProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- по конвенции проекта (см. FormFields)
  form: any;
};

/** Редактор секций страницы категории: список с переупорядочиванием + добавление по типу. */
export const SectionsEditorField = ({ form }: SectionsEditorFieldProps) => (
  <VStack gap="sm">
    <Label>{typo("Секции страницы")}</Label>
    <form.Field name="sections" mode="array">
      {(sectionsField: AnyFieldApi) => {
        const sections = (sectionsField.state.value ?? []) as CategorySection[];
        return (
          <VStack gap="md">
            {sections.map((section, index) => {
              const namePrefix = `sections[${index}]`;
              return (
                <SectionCardShell
                  key={section.id}
                  label={sectionLabel(section)}
                  canMoveUp={index > 0}
                  canMoveDown={index < sections.length - 1}
                  onMoveUp={() => sectionsField.moveValue(index, index - 1)}
                  onMoveDown={() => sectionsField.moveValue(index, index + 1)}
                  onRemove={() => sectionsField.removeValue(index)}
                >
                  <form.Field name={`${namePrefix}.title`}>
                    {(field: AnyFieldApi) => (
                      <TextField
                        fieldApi={field}
                        field={{ label: typo("Заголовок секции"), placeholder: typo("Без заголовка") }}
                      />
                    )}
                  </form.Field>
                  {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- form: any (см. FormFields) */}
                  {renderEditor(section, { form, namePrefix })}
                </SectionCardShell>
              );
            })}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline">
                  <Plus className="size-4" />
                  {typo("Добавить секцию")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {SECTION_TYPES.map((type) => (
                  <DropdownMenuItem key={type} onSelect={() => sectionsField.pushValue(makeSection(type))}>
                    {SECTION_TYPE_LABELS[type]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </VStack>
        );
      }}
    </form.Field>
  </VStack>
);
