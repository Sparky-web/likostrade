"use client";

import { api } from "~/trpc/react";

export const useProjectById = (id: string | undefined) => {
  return api.projects.getById.useQuery(
    { id: id ?? "" },
    {
      enabled: Boolean(id),
    },
  );
};
