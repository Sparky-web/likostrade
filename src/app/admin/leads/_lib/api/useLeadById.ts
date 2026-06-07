"use client";

import { api } from "~/trpc/react";

export const useLeadById = (id: string | undefined) => {
  return api.leads.getById.useQuery(
    { id: id ?? "" },
    {
      enabled: Boolean(id),
    },
  );
};
