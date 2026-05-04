"use client";

import { typo } from "lib";
import { useContext } from "react";

import { AdaptiveContext, type AdaptiveValue } from "~/components/utils/AdaptiveContext";

/**
 * Подписка на `AdaptiveContext` (`isMobile` при ширине вьюпорта **меньше** `768px`, иначе `isDesktop`).
 * Дерево должно быть обёрнуто в `AdaptiveProvider`.
 */
export function useAdaptive(): AdaptiveValue {
  const ctx = useContext(AdaptiveContext);
  if (ctx === null) {
    throw new Error(typo(`useAdaptive: нет провайдера \`AdaptiveProvider\` в дереве.`));
  }
  return ctx;
}
