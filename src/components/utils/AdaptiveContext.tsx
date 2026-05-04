"use client";

import {
  createContext,
  type ReactNode,
  useMemo,
  useSyncExternalStore,
} from "react";

/**
 * Граница «мобильный / десктоп» по ширине вьюпорта (согласуется с `md` в Tailwind).
 * `isMobile` — строго при `width < ADAPTIVE_BREAKPOINT_MIN_WIDTH_PX`.
 */
export const ADAPTIVE_BREAKPOINT_MIN_WIDTH_PX = 768;

const MEDIA_MAX_MOBILE = `(max-width: ${ADAPTIVE_BREAKPOINT_MIN_WIDTH_PX - 1}px)`;

export type AdaptiveValue = {
  readonly isMobile: boolean;
  /** `true`, если ширина вьюпорта ≥ `ADAPTIVE_BREAKPOINT_MIN_WIDTH_PX` (т.е. не мобилка). */
  readonly isDesktop: boolean;
};

function subscribeMobileMatch(callback: () => void) {
  const mq = window.matchMedia(MEDIA_MAX_MOBILE);
  mq.addEventListener("change", callback);
  return () => {
    mq.removeEventListener("change", callback);
  };
}

function getIsMobileClientSnapshot(): boolean {
  return window.matchMedia(MEDIA_MAX_MOBILE).matches;
}

/** Снимок на сервере: без `window` считаем десктоп, чтобы уменьшить сдвиг при гидрации */
function getIsMobileServerSnapshot(): boolean {
  return false;
}

export const AdaptiveContext = createContext<AdaptiveValue | null>(null);

type AdaptiveProviderProps = { children: ReactNode };

export function AdaptiveProvider({ children }: AdaptiveProviderProps) {
  const isMobile = useSyncExternalStore(
    subscribeMobileMatch,
    getIsMobileClientSnapshot,
    getIsMobileServerSnapshot,
  );
  const value = useMemo(
    (): AdaptiveValue => ({ isMobile, isDesktop: !isMobile }),
    [isMobile],
  );
  return <AdaptiveContext.Provider value={value}>{children}</AdaptiveContext.Provider>;
}
