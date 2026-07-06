"use client";

import { typo } from "lib";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { PropsWithChildren } from "react";

import { Badge, Button, Card, CardContent, HStack, PopConfirm, VStack } from "~/components";

type SectionCardShellProps = PropsWithChildren<{
  /** Название типа секции (и блока для спец-секций) в шапке карточки. */
  label: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}>;

/** Карточка секции в редакторе: заголовок с типом + управление порядком/удалением. */
export const SectionCardShell = ({
  label,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
}: SectionCardShellProps) => (
  <Card size="sm">
    <CardContent>
      <VStack gap="md">
        <HStack align="center" justify="between">
          <Badge variant="secondary">{label}</Badge>
          <HStack gap="2xs">
            <Button type="button" variant="ghost" size="icon" disabled={!canMoveUp} onClick={onMoveUp}>
              <ChevronUp className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" disabled={!canMoveDown} onClick={onMoveDown}>
              <ChevronDown className="size-4" />
            </Button>
            <PopConfirm title={typo("Удалить секцию?")} onConfirm={onRemove}>
              <Button type="button" variant="ghost" size="icon">
                <Trash2 className="text-destructive size-4" />
              </Button>
            </PopConfirm>
          </HStack>
        </HStack>
        {children}
      </VStack>
    </CardContent>
  </Card>
);
