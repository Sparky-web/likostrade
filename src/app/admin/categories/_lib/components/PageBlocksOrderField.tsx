"use client";

import type { AnyFieldApi } from "@tanstack/react-form";
import { typo } from "lib";
import { ChevronDown, ChevronUp } from "lucide-react";

import { CATEGORY_PAGE_BLOCKS, type CategoryPageBlockKey, normalizeCategoryPageBlockOrder } from "~/categories/pageBlocks";
import { Button, Card, CardContent, HStack, Label, Switch, Text, VStack } from "~/components";

type PageBlocksOrderFieldProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- по конвенции формы категорий и SectionsEditorField
  form: any;
};

/** Единый список системных блоков: порядок задаётся стрелками, видимость — переключателем в той же строке. */
export const PageBlocksOrderField = ({ form }: PageBlocksOrderFieldProps) => (
  <VStack gap="sm">
    <Label>{typo("Блоки страницы")}</Label>
    <form.Field name="pageBlocksOrder" mode="array">
      {(orderField: AnyFieldApi) => {
        const order = normalizeCategoryPageBlockOrder(orderField.state.value);

        return (
          <VStack gap="sm">
            {order.map((blockKey: CategoryPageBlockKey, index: number) => {
              const block = CATEGORY_PAGE_BLOCKS[blockKey];

              return (
                <Card key={blockKey} size="sm">
                  <CardContent>
                    <HStack align="center" justify="between" gap="sm">
                      <div className="min-w-0 flex-1">
                        <Text bold breakWords>
                          {block.label}
                        </Text>
                      </div>
                      <HStack align="center" gap="2xs">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={index === 0}
                          aria-label={typo(`Поднять блок «${block.label}»`)}
                          title={typo("Поднять")}
                          onClick={() => orderField.moveValue(index, index - 1)}
                        >
                          <ChevronUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={index === order.length - 1}
                          aria-label={typo(`Опустить блок «${block.label}»`)}
                          title={typo("Опустить")}
                          onClick={() => orderField.moveValue(index, index + 1)}
                        >
                          <ChevronDown className="size-4" />
                        </Button>
                        <form.Field name={block.visibilityField}>
                          {(visibilityField: AnyFieldApi) => (
                            <Switch
                              className="ml-2"
                              checked={Boolean(visibilityField.state.value)}
                              aria-label={typo(`Показывать блок «${block.label}»`)}
                              onCheckedChange={(checked) => visibilityField.handleChange(checked)}
                              onBlur={visibilityField.handleBlur}
                            />
                          )}
                        </form.Field>
                      </HStack>
                    </HStack>
                  </CardContent>
                </Card>
              );
            })}
          </VStack>
        );
      }}
    </form.Field>
  </VStack>
);
