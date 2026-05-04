import type { RouterOutputs } from "~/trpc/react";

type ProjectListItem = RouterOutputs["projects"]["get"][number];

/** Сортировка по dateCompleted (YYYY-MM-DD): от новых к старым. */
export const sortProjectsByDateCompleted = (projects: ProjectListItem[]) =>
  [...projects].sort((a, b) => b.dateCompleted.localeCompare(a.dateCompleted));
