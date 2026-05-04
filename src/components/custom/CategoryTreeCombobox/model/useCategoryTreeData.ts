"use client";

import { useMemo } from "react";

import { api } from "~/trpc/react";

import { buildCategoryTree } from "../lib/buildCategoryTree";
import { pruneCategoryTree } from "../lib/pruneCategoryTree";

type UseCategoryTreeDataParams = {
  allowedCategoryIds?: string[];
  includeHidden?: boolean;
};

export const useCategoryTreeData = ({ allowedCategoryIds, includeHidden = false }: UseCategoryTreeDataParams = {}) => {
  const { data, isPending, isError } = api.categories.get.useQuery(
    includeHidden ? undefined : { where: { isHidden: false } },
  );

  const categories = useMemo(() => data ?? [], [data]);

  const categoriesById = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const tree = useMemo(() => {
    const fullTree = buildCategoryTree(categories);

    if (allowedCategoryIds == null || allowedCategoryIds.length === 0) {
      return fullTree;
    }

    return pruneCategoryTree(fullTree, new Set(allowedCategoryIds));
  }, [categories, allowedCategoryIds]);

  return { categories, categoriesById, tree, isPending, isError };
};
