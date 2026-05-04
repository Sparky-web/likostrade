"use client";

import { type EffectCallback, useEffect } from "react";

/** Выполняет эффект один раз после монтирования (аналог `useEffect(fn, [])`). */
export function useMountEffect(effect: EffectCallback): void {
  useEffect(() => {
    return effect();
    // effect намеренно не в deps — только при mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
