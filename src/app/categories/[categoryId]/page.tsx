import { typo } from "lib";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container, Heading, Headline, VStack } from "~/components";
import { hasSpecialSection } from "~/sections/schema";
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

  // Спец-блок «Список подкатегорий» в секциях управляет местом вывода сам — автоматику не дублируем
  const hasSubcategoryListSection = hasSpecialSection(category.sections, "subcategoryList");
  const tiles =
    category.childrenMode === "TILES" && !hasSubcategoryListSection ? (
      <CategoryTilesSection categories={visibleSubcategories} />
    ) : null;
  const sections = hasSections ? (
    <SectionsRenderer
      sections={category.sections}
      context={{ categoryId: category.id, subcategories: visibleSubcategories, childrenMode: category.childrenMode }}
    />
  ) : null;
  // SIDEBAR-узлы показывают детей и в дереве, и крупными карточками в контенте (как категория на evraz.pro);
  // LIST — компактные строки (исполнения, серии)
  const cards =
    category.childrenMode !== "TILES" && !hasSubcategoryListSection ? (
      <SubcategoryCards
        categories={visibleSubcategories}
        variant={category.childrenMode === "LIST" ? "list" : "cards"}
      />
    ) : null;

  return (
    <HydrateClient>
      {category.headerMode === "COMPACT" || category.headerMode === "MINIMAL" ? (
        <CategoryCompactHeader
          title={title}
          description={category.shortDescription ? typo(category.shortDescription) : undefined}
          breadcrumbs={breadcrumbs}
          variant={category.headerMode === "MINIMAL" ? "minimal" : "compact"}
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
      {/* После компактной шапки с разделителем контенту нужен собственный отступ; у минимальной он мал — заголовок принадлежит контенту */}
      <VStack
        gap="section"
        className={
          category.headerMode === "COMPACT" ? "pt-10 md:pt-12" : category.headerMode === "MINIMAL" ? "pt-6" : undefined
        }
      >
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
