import { typo } from "lib";
import { Fragment } from "react";

import { Heading, Separator, Text, VStack } from "~/components";
import type { RouterOutputs } from "~/trpc/react";

import fallbackProjectImage from "../../../../_lib/lib/metal.jpg";
import { collectProjectImageIds } from "../lib/collectProjectImages";
import { ProjectContentSection } from "./ProjectContentSection";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectQuickInfo } from "./ProjectQuickInfo";

type ProjectDetailsProps = {
  project: NonNullable<RouterOutputs["projects"]["getById"]>;
};

export const ProjectDetails = ({ project }: ProjectDetailsProps) => {
  const imageIds = collectProjectImageIds(project);

  const contentSections = [
    { title: typo("Задача"), html: project.task },
    { title: typo("Процесс работы"), html: project.workProgress },
    { title: typo("Результат"), html: project.result },
  ].filter((section): section is { title: string; html: string } => Boolean(section.html));

  const categoryLabel =
    project.categories.length > 0
      ? project.categories.map((category) => typo(category.title)).join(", ")
      : undefined;

  return (
    <VStack gap="section">
      <VStack gap="xs">
        {categoryLabel ? <Text variant="muted">{categoryLabel}</Text> : undefined}
        <Heading variant="h1">{typo(project.title)}</Heading>
      </VStack>

      <ProjectGallery imageIds={imageIds} title={project.title} fallbackImage={fallbackProjectImage} />

      <ProjectQuickInfo price={project.price} timeToComplete={project.timeToComplete} />

      {contentSections.length > 0 ? (
        <div>
          {contentSections.map((section, index) => (
            <Fragment key={section.title}>
              {index > 0 ? <Separator /> : undefined}
              <ProjectContentSection title={section.title} html={section.html} />
            </Fragment>
          ))}
        </div>
      ) : undefined}
    </VStack>
  );
};
