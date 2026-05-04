import type { PropsWithChildren } from "react";

import { api } from "~/trpc/server";

import { SiteSettingsContextProvider } from "./SiteSettingsContext";

export async function SiteSettingsProvider({ children }: PropsWithChildren) {
  const siteSettings = await api.siteSettings.getPublic();

  return <SiteSettingsContextProvider value={siteSettings}>{children}</SiteSettingsContextProvider>;
}
