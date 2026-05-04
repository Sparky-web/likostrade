"use client";

import { useSiteSettings } from "../model/SiteSettingsContext";
import { CompletedProjects } from "./CompletedProjects";

/** Блок завершённых проектов на главной — данные из публичных настроек сайта. */
export function HomeCompletedProjects() {
  const { homepagePinnedProjects } = useSiteSettings();

  return <CompletedProjects projects={homepagePinnedProjects} />;
}
