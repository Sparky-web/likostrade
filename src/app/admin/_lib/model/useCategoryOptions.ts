"use client";

import { useMemo } from "react";

import { api } from "~/trpc/react";

// Опции для SelectField/SelectMultipleField категорий, общие для всех админ-страниц
// excludeId полезен, когда нельзя ссылаться на саму себя (см. подкатегории Category)
export const useCategoryOptions = (excludeId?: string) => {
  const { data } = api.categories.get.useQuery();

  return useMemo(() => {
    return (data ?? [])
      .filter((category) => category.id !== excludeId)
      .map((category) => ({ label: category.title, value: category.id }));
  }, [data, excludeId]);
};
