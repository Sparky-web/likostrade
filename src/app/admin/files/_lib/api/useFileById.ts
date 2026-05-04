"use client";

import { api } from "~/trpc/react";

export const useFileById = (id: string | undefined) => {
  return api.files.getById.useQuery(
    { id: id ?? "" },
    {
      enabled: Boolean(id),
    },
  );
};
