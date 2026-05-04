import { typo } from "lib";
import { notFound } from "next/navigation";

import { Button, Container, Headline, VStack } from "~/components";
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
  Videos,
} from "../../_lib";

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { categoryId } = await params;

  const [category, completedProjects] = await Promise.all([
    api.categories.getById({ id: categoryId }),
    api.projects.getPreviewByCategory({ categoryId }),
  ]);

  if (!category || category.isHidden) notFound();

  const visibleSubcategories = category.subcategories.filter((sub) => !sub.isHidden);

  const uploadSrc: `/uploads/${string}` | undefined = category.imageId ? `/uploads/${category.imageId}` : undefined;

  return (
    <HydrateClient>
      <Headline
        title={category.landingTitle ? typo(category.landingTitle) : typo(category.title)}
        description={category.shortDescription ? typo(category.shortDescription) : undefined}
        button={
          <Button size="lg" className="rounded-md">
            {typo(`Оформить заявку`)}
          </Button>
        }
        image={metalHeadlineImage}
        uploadSrc={uploadSrc}
      />
      <VStack gap="section">
        <CategoryTilesSection categories={visibleSubcategories} />
        {category.htmlDescription ? (
          <Container>
            <div className="rich-html-content mt-8 text-lg" dangerouslySetInnerHTML={{ __html: category.htmlDescription }} />
          </Container>
        ) : null}
        <CompletedProjects
          projects={completedProjects}
          viewAllHref={getCompletedProjectsViewAllHref(categoryId)}
        />
        <ClientsPartnersSection />
        <Videos />
        <Licenses />
        <RequestForm />
      </VStack>
      <Contacts />
    </HydrateClient>
  );
}
