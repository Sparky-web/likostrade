"use client";

import { createContext, type PropsWithChildren, useContext } from "react";

import type { RouterOutputs } from "~/trpc/react";

export type SiteSettingsContextType = RouterOutputs["siteSettings"]["getPublic"];

export const SiteSettingsContext = createContext<SiteSettingsContextType | null>(null);

export function SiteSettingsContextProvider({
  value,
  children,
}: PropsWithChildren<{ value: SiteSettingsContextType }>) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettingsContextType {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
}
