"use client";

import { api } from "~/trpc/react";

// Хук-обёртка над tRPC-запросом: запрос делается только при наличии id
export const useCategoryById = (id: string | undefined) => {
  return api.categories.getById.useQuery(
    { id: id ?? "" },
    {
      enabled: Boolean(id),
    },
  );
};
