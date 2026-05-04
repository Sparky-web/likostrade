"use client";

import { typo } from "lib";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";

import { AdaptiveGrid, ProductCard, Text, VStack } from "~/components";
import type { RouterOutputs } from "~/trpc/react";

import { sortProjectsByDateCompleted } from "../lib/sortProjectsByDate";
import { ProjectsCategoryFilter } from "./ProjectsCategoryFilter";

type ProjectListItem = RouterOutputs["projects"]["get"][number];

type ProjectsCatalogProps = {
  projects: ProjectListItem[];
  allowedCategoryIds: string[];
};

const projectMatchesCategories = (project: ProjectListItem, categoryIds: string[]) => {
  if (categoryIds.length === 0) return true;
  const ids = project.categories.map((category) => category.id);
  return categoryIds.some((id) => ids.includes(id));
};

export const ProjectsCatalog = ({ projects, allowedCategoryIds }: ProjectsCatalogProps) => {
  const [categoryIds, setCategoryIds] = useQueryState("categories", parseAsArrayOf(parseAsString, ",").withDefault([]));

  const filteredProjects = useMemo(() => {
    const matched = projects.filter((project) => projectMatchesCategories(project, categoryIds));
    return sortProjectsByDateCompleted(matched);
  }, [projects, categoryIds]);

  return (
    <VStack gap="xl">
      <ProjectsCategoryFilter
        allowedCategoryIds={allowedCategoryIds}
        selectedCategories={categoryIds}
        onCategoriesChange={setCategoryIds}
      />

      {filteredProjects.length === 0 ? (
        <Text color="supplementary">{typo("По выбранным категориям работы не найдены.")}</Text>
      ) : (
        <AdaptiveGrid cols={{ base: 1, md: 2, lg: 3 }} gap="3xl">
          {filteredProjects.map((project) => (
            <ProductCard
              key={project.id}
              href={`/projects/${project.id}`}
              image={project.mainImageId ? `/uploads/${project.mainImageId}` : undefined}
              title={typo(project.title)}
              dateCompleted={project.dateCompleted}
              description={project.shortDescription ? typo(project.shortDescription) : ""}
            />
          ))}
        </AdaptiveGrid>
      )}
    </VStack>
  );
};
