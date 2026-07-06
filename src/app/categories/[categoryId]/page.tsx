import { typo } from "lib";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container, Headline, VStack } from "~/components";
import { api, HydrateClient } from "~/trpc/server";

import {
  CategoryTilesSection,
  ClientsPartnersSection,
  CompletedProjects,
  Contacts,
  getCompletedProjectsViewAllHref,
  Licenses,
  metalHeadlineImage,
  RequestForm,
  RequestFormScrollButton,
  SectionsRenderer,
  Videos,
} from "../../_lib";

interface PageProps {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ isExp?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const category = await api.categories.getById({ id: categoryId });

  if (!category || category.isHidden) {
    return {};
  }

  return {
    title: category.title,
    description: category.shortDescription ? category.shortDescription : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { categoryId } = await params;
  const { isExp } = await searchParams;

  const [category, completedProjects, previewVideos] = await Promise.all([
    api.categories.getById({ id: categoryId }),
    api.projects.getPreviewByCategory({ categoryId }),
    api.videos.getPreviewByCategory({ categoryId }),
  ]);

  if (!category || category.isHidden) notFound();

  const visibleSubcategories = category.subcategories.filter((sub) => !sub.isHidden);

  const uploadSrc: `/uploads/${string}` | undefined = category.imageId ? `/uploads/${category.imageId}` : undefined;

  const headlineTitle = category.landingTitle ?? category.title;
  const title = typo(isExp === "1" ? `${headlineTitle} в Екатеринбурге` : headlineTitle);

  return (
    <HydrateClient>
      <Headline
        title={title}
        description={category.shortDescription ? typo(category.shortDescription) : undefined}
        button={<RequestFormScrollButton />}
        image={metalHeadlineImage}
        uploadSrc={uploadSrc}
      />
      <VStack gap="section">
        <CategoryTilesSection categories={visibleSubcategories} />
        {Array.isArray(category.sections) && category.sections.length > 0 ? (
          <Container>
            <SectionsRenderer sections={category.sections} />
          </Container>
        ) : null}
        <CompletedProjects projects={completedProjects} viewAllHref={getCompletedProjectsViewAllHref(categoryId)} />
        <ClientsPartnersSection />
        <Videos videos={previewVideos} />
        <Licenses />
        <RequestForm categoryId={categoryId} />
      </VStack>
      <Contacts />
    </HydrateClient>
  );
}
