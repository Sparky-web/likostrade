import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "~/components";
import { api, HydrateClient } from "~/trpc/server";

import { Contacts, RequestForm } from "../../_lib";
import { ProjectDetails } from "./_lib/components/ProjectDetails";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { projectId } = await params;
  const project = await api.projects.getById({ id: projectId });

  if (!project || project.isHidden) {
    return {};
  }

  return {
    title: project.title,
    description: project.shortDescription ? project.shortDescription : undefined,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { projectId } = await params;
  const project = await api.projects.getById({ id: projectId });

  if (!project || project.isHidden) notFound();

  return (
    <HydrateClient>
      <Container className="py-12">
        <ProjectDetails project={project} />
      </Container>
      <RequestForm projectId={projectId} />
      <Contacts />
    </HydrateClient>
  );
}
