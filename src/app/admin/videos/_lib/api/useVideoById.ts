"use client";

import { api } from "~/trpc/react";

export const useVideoById = (id: string | undefined) => {
  return api.videos.getById.useQuery(
    { id: id ?? "" },
    {
      enabled: Boolean(id),
    },
  );
};
