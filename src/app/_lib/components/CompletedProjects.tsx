"use client";

import { typo } from "lib";

import { AdaptiveGrid, Button, Container, Heading, HStack, Link, ProductCard, useAdaptive, VStack } from "~/components";

import { type CompletedProjectListItem, getCompletedProjectsViewAllHref } from "../lib/completedProjects";

interface CompletedProjectsProps {
  projects: CompletedProjectListItem[];
  /** Куда ведёт «Посмотреть все»; по умолчанию — общий каталог работ. */
  viewAllHref?: string;
}

export function CompletedProjects({ projects, viewAllHref = getCompletedProjectsViewAllHref() }: CompletedProjectsProps) {
  const { isMobile } = useAdaptive();

  if (projects.length === 0) {
    return null;
  }

  return (
    <Container>
      <VStack gap="section">
        {isMobile ? (
          <Heading variant="h2">{typo(`Наши завершенные проекты`)}</Heading>
        ) : (
          <HStack justify="between" align="center">
            <Heading variant="h2">{typo(`Наши завершенные проекты`)}</Heading>
            <Link href={viewAllHref}>
              <Button variant={"ghost"} size="lg">
                {typo(`Посмотреть все →`)}
              </Button>
            </Link>
          </HStack>
        )}
        <AdaptiveGrid cols={{ base: 1, md: 2, lg: 3 }} gap="xl">
          {projects.map((project) => (
            <ProductCard
              key={project.id}
              href={`/projects/${project.id}`}
              image={project.mainImageId ? `/uploads/${project.mainImageId}` : undefined}
              title={typo(project.title)}
              dateCompleted={project.dateCompleted}
              description={project.shortDescription ? typo(project.shortDescription) : ""}
              badges={[project.price, project.timeToComplete].filter((badge): badge is string => Boolean(badge))}
            />
          ))}
        </AdaptiveGrid>
        {isMobile && (
          <Link href={viewAllHref} className="w-full">
            <Button variant={"ghost"} size="lg" className="w-full">
              {typo(`Посмотреть все →`)}
            </Button>
          </Link>
        )}
      </VStack>
    </Container>
  );
}
