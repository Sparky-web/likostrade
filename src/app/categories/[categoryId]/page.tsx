import { typo } from "lib";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container, Heading, Headline, VStack } from "~/components";
import { api, HydrateClient } from "~/trpc/server";

import {
  CategoryCompactHeader,
  CategorySidebar,
  CategoryTilesSection,
  ClientsPartnersSection,
  CompletedProjects,
  Contacts,
  getCategoryPath,
  getCompletedProjectsViewAllHref,
  getSidebarContext,
  Licenses,
  metalHeadlineImage,
  RequestForm,
  RequestFormScrollButton,
  SectionsRenderer,
  SubcategoryCards,
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

  const [category, allCategories, completedProjects, previewVideos] = await Promise.all([
    api.categories.getById({ id: categoryId }),
    api.categories.get(),
    api.projects.getPreviewByCategory({ categoryId }),
    api.videos.getPreviewByCategory({ categoryId }),
  ]);

  if (!category || category.isHidden) notFound();

  const visibleCategories = allCategories.filter((item) => !item.isHidden);
  const visibleSubcategories = category.subcategories.filter((sub) => !sub.isHidden);
  const sidebarContext = getSidebarContext(visibleCategories, category.id);
  const hasSections = Array.isArray(category.sections) && category.sections.length > 0;

  const uploadSrc: `/uploads/${string}` | undefined = category.imageId ? `/uploads/${category.imageId}` : undefined;

  const headlineTitle = category.landingTitle ?? category.title;
  const title = typo(isExp === "1" ? `${headlineTitle} в Екатеринбурге` : headlineTitle);

  const breadcrumbPath = getCategoryPath(visibleCategories, category.id);
  const breadcrumbs = [
    { title: typo("Главная"), href: "/" },
    ...breadcrumbPath.map((item, index) => ({
      title: item.title,
      href: index < breadcrumbPath.length - 1 ? `/categories/${item.id}` : undefined,
    })),
  ];

  const tiles = category.childrenMode === "TILES" ? <CategoryTilesSection categories={visibleSubcategories} /> : null;
  const sections = hasSections ? <SectionsRenderer sections={category.sections} /> : null;
  const cards = category.childrenMode === "CARDS" ? <SubcategoryCards categories={visibleSubcategories} /> : null;

  return (
    <HydrateClient>
      {category.headerMode === "COMPACT" ? (
        <CategoryCompactHeader
          title={title}
          description={category.shortDescription ? typo(category.shortDescription) : undefined}
          breadcrumbs={breadcrumbs}
        />
      ) : (
        <Headline
          title={title}
          description={category.shortDescription ? typo(category.shortDescription) : undefined}
          button={<RequestFormScrollButton />}
          image={metalHeadlineImage}
          uploadSrc={uploadSrc}
        />
      )}
      <VStack gap="section">
        {sidebarContext ? (
          <Container>
            <VStack gap="xl">
              {category.headerMode === "HERO" ? (
                <Heading variant="h2">{typo(category.catalogTitle ?? "Каталог")}</Heading>
              ) : null}
              <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(0,17rem)_1fr] lg:grid-cols-[minmax(0,19rem)_1fr] lg:gap-12">
                <CategorySidebar context={sidebarContext} />
                <VStack gap="section" className="min-w-0">
                  {tiles}
                  {sections}
                  {cards}
                </VStack>
              </div>
            </VStack>
          </Container>
        ) : (
          <>
            {tiles}
            {sections ? <Container>{sections}</Container> : null}
            {cards ? <Container>{cards}</Container> : null}
          </>
        )}
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
