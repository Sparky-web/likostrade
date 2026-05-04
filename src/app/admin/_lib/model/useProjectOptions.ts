"use client";

import { useMemo } from "react";

import { formatDate } from "~/components";
import { api } from "~/trpc/react";

import { sortProjectsByDateCompleted } from "../../../projects/_lib/lib/sortProjectsByDate";

/** Опции работ для SelectMultipleField: от новых к старым, название — основной текст. */
export const useProjectOptions = () => {
  const { data } = api.projects.get.useQuery();

  return useMemo(() => {
    return sortProjectsByDateCompleted(data ?? []).map((project) => ({
      value: project.id,
      label: project.title,
      description: `${formatDate(project.dateCompleted)} · ${project.id}`,
    }));
  }, [data]);
};
