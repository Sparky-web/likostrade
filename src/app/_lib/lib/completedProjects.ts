import type { RouterOutputs } from "~/trpc/react";

export type CompletedProjectListItem = RouterOutputs["projects"]["get"][number];

export const COMPLETED_PROJECTS_PREVIEW_LIMIT = 3;

/** Берёт первые N работ (список уже отсортирован на сервере по dateCompleted desc). */
export const takeLatestProjects = (
  projects: CompletedProjectListItem[],
  limit = COMPLETED_PROJECTS_PREVIEW_LIMIT,
) => projects.slice(0, limit);

/** Ссылка «Посмотреть все» — с фильтром категории или на общий каталог. */
export const getCompletedProjectsViewAllHref = (categoryId?: string) =>
  categoryId ? `/projects?categories=${encodeURIComponent(categoryId)}` : "/projects";
