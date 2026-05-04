import { typo } from "lib";

import { Container, Heading, VStack } from "~/components";
import { api, HydrateClient } from "~/trpc/server";

import { Contacts } from "../_lib";
import { ProjectsCatalog } from "./_lib/components/ProjectsCatalog";
import { sortProjectsByDateCompleted } from "./_lib/lib/sortProjectsByDate";

export default async function ProjectsPage() {
  const [projects, categories] = await Promise.all([
    api.projects.get({ where: { isHidden: false } }),
    api.categories.get({ where: { isHidden: false } }),
  ]);

  const sortedProjects = sortProjectsByDateCompleted(projects);

  const categoryIdsInProjects = new Set(
    sortedProjects.flatMap((project) => project.categories.map((category) => category.id)),
  );

  const allowedCategoryIds = categories
    .filter((category) => categoryIdsInProjects.has(category.id))
    .map((category) => category.id);

  return (
    <HydrateClient>
      <Container className="py-12">
        <VStack gap="section">
          <Heading variant="h1">{typo("Наши работы")}</Heading>
          <ProjectsCatalog projects={sortedProjects} allowedCategoryIds={allowedCategoryIds} />
        </VStack>
      </Container>
      <Contacts />
    </HydrateClient>
  );
}
