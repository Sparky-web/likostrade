import { typo } from "lib";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Fragment, type ReactNode } from "react";

import { type CategoryPageBlockKey, normalizeCategoryPageBlockOrder } from "~/categories/pageBlocks";
import { Container, Heading, Headline, Text, VStack } from "~/components";
import { parseSections } from "~/sections/schema";
import { api, HydrateClient } from "~/trpc/server";

import {
  AboutUs,
  CategoryBreadcrumbs,
  CategoryCompactHeader,
  CategoryCtaButton,
  CategorySidebar,
  CategoryTilesSection,
  CompletedProjects,
  Contacts,
  getCategoryPath,
  getCompletedProjectsViewAllHref,
  getSidebarContext,
  getSiteBaseUrl,
  JsonLd,
  metalHeadlineImage,
  RequestForm,
  RequestQuoteBlock,
  SectionsRenderer,
  SubcategoryCards,
  Videos,
} from "../../_lib";

/** Дедупликация в рамках одного запроса: getById зовут и generateMetadata, и страница. */
const getCategoryById = cache((id: string) => api.categories.getById({ id }));

interface PageProps {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ isExp?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const category = await getCategoryById(categoryId);

  if (!category || category.isHidden) {
    return {};
  }

  // Гео в title — ключевой коммерческий модификатор для локальной выдачи; бренд добавит шаблон из layout
  const title = typo(`${category.title} в Екатеринбурге`);
  const description = category.shortDescription ?? undefined;
  const url = `/categories/${categoryId}`;
  const image = category.imageId ? `/uploads/${category.imageId}` : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: image ? [image] : undefined,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { categoryId } = await params;
  const { isExp } = await searchParams;

  // Категорию проверяем ДО остальных запросов: getPreviewByCategory бросает NOT_FOUND для несуществующей
  // категории — в общем Promise.all это дало бы 500 вместо честного 404.
  const category = await getCategoryById(categoryId);
  if (!category || category.isHidden) notFound();

  const [allCategories, completedProjects, previewVideos] = await Promise.all([
    api.categories.getTree(),
    api.projects.getPreviewByCategory({ categoryId }),
    api.videos.getPreviewByCategory({ categoryId }),
  ]);

  const visibleCategories = allCategories.filter((item) => !item.isHidden);
  const visibleSubcategories = category.subcategories.filter((sub) => !sub.isHidden);
  const sidebarContextRaw = getSidebarContext(visibleCategories, category.id);
  const sidebarContext = sidebarContextRaw && sidebarContextRaw.tree.length > 0 ? sidebarContextRaw : null;
  const parsedSections = parseSections(category.sections);
  const hasCompactHeader = category.headerMode === "COMPACT" || category.headerMode === "MINIMAL";
  const titleInCatalogContent = Boolean(sidebarContext && hasCompactHeader);

  const uploadSrc: `/uploads/${string}` | undefined = category.imageId ? `/uploads/${category.imageId}` : undefined;

  const headlineTitle = category.landingTitle ?? category.title;
  // Эксперимент для рекламы: ?isExp=1 дописывает гео к видимому заголовку
  // (title-метадата всегда с гео — отдельное SEO-решение, флаг её не трогает)
  const title = typo(isExp === "1" ? `${headlineTitle} в Екатеринбурге` : headlineTitle);

  const breadcrumbPath = getCategoryPath(visibleCategories, category.id);
  const breadcrumbs = [
    { title: typo("Главная"), href: "/" },
    ...breadcrumbPath.map((item, index) => ({
      title: item.title,
      href: index < breadcrumbPath.length - 1 ? `/categories/${item.id}` : undefined,
    })),
  ];

  // BreadcrumbList для поисковиков (видимые крошки есть в COMPACT/MINIMAL-шапке)
  const baseUrl = getSiteBaseUrl();
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.title,
      ...(crumb.href ? { item: `${baseUrl}${crumb.href}` } : {}),
    })),
  };

  // Мёртвую hero-CTA больше нет: кнопка скроллит к инлайн-форме, а если та выключена — открывает модалку.
  // Спец-секцию «Запрос цены» (если она уже добавлена в контент категории) не дублируем автоматической.
  const hasRequestQuoteSection = parsedSections.some(
    (section) => section.type === "special" && section.block === "requestQuote",
  );
  const ctaButton = <CategoryCtaButton categoryId={category.id} hasInlineForm={category.showRequestForm} />;

  // Спец-блок «Список подкатегорий» в секциях управляет местом вывода сам — автоматику не дублируем
  const hasSubcategoryListSection = parsedSections.some(
    (section) => section.type === "special" && section.block === "subcategoryList",
  );
  const tiles =
    category.childrenMode === "TILES" && visibleSubcategories.length > 0 && !hasSubcategoryListSection ? (
      <CategoryTilesSection categories={visibleSubcategories} />
    ) : null;
  const sections =
    parsedSections.length > 0 ? (
      <SectionsRenderer
        sections={parsedSections}
        context={{ categoryId: category.id, subcategories: visibleSubcategories, childrenMode: category.childrenMode }}
      />
    ) : null;
  // SIDEBAR-узлы показывают детей и в дереве, и крупными карточками в контенте (как категория на evraz.pro);
  // LIST — компактные строки (исполнения, серии)
  const cards =
    category.childrenMode !== "TILES" && visibleSubcategories.length > 0 && !hasSubcategoryListSection ? (
      <SubcategoryCards categories={visibleSubcategories} variant={category.childrenMode === "LIST" ? "list" : "cards"} />
    ) : null;

  const pageBlocksOrder = normalizeCategoryPageBlockOrder(category.pageBlocksOrder);
  // Контакты исторически замыкают страницу без дополнительного gap. Сохраняем эту вёрстку, пока блок последний;
  // если администратор поднимет его выше, он становится обычным элементом общего потока секций.
  const hasTrailingContacts = pageBlocksOrder.at(-1) === "contacts";
  const pageBlocksInFlow = hasTrailingContacts ? pageBlocksOrder.slice(0, -1) : pageBlocksOrder;

  const renderPageBlockSlot = (blockKey: CategoryPageBlockKey) => {
    let block: ReactNode = null;

    switch (blockKey) {
      case "aboutUs":
        block = category.showClientsPartners ? <AboutUs /> : null;
        break;
      case "completedProjects":
        block = category.showCompletedProjects ? (
          <CompletedProjects projects={completedProjects} viewAllHref={getCompletedProjectsViewAllHref(categoryId)} />
        ) : null;
        break;
      case "requestForm":
        block = category.showRequestForm ? <RequestForm categoryId={categoryId} /> : null;
        break;
      case "contacts":
        block = category.showContacts ? <Contacts /> : null;
        break;
    }

    return (
      <Fragment key={blockKey}>
        {block}
        {/* Эти два блока не управляются комбинированным списком. Они сохраняют прежние опорные места:
            CTA следует за «О нас», видео — за завершёнными проектами, даже если опорный блок выключен. */}
        {blockKey === "aboutUs" && !hasRequestQuoteSection ? (
          <Container>
            <RequestQuoteBlock categoryId={category.id} />
          </Container>
        ) : null}
        {blockKey === "completedProjects" ? <Videos videos={previewVideos} /> : null}
      </Fragment>
    );
  };

  return (
    <HydrateClient>
      <JsonLd data={breadcrumbJsonLd} />
      {hasCompactHeader ? (
        titleInCatalogContent ? null : (
          <CategoryCompactHeader
            title={title}
            description={category.shortDescription ? typo(category.shortDescription) : undefined}
            breadcrumbs={breadcrumbs}
            variant={category.headerMode === "MINIMAL" ? "minimal" : "compact"}
            cta={ctaButton}
          />
        )
      ) : (
        <Headline
          title={title}
          description={category.shortDescription ? typo(category.shortDescription) : undefined}
          button={ctaButton}
          image={metalHeadlineImage}
          uploadSrc={uploadSrc}
        />
      )}
      {/* Отступ от шапки: у минимальной мал (заголовок принадлежит контенту), у compact всегда,
          у hero — только когда первым идёт контент (плитки прилегают к баннеру, как исторически) */}
      <VStack
        gap="section"
        className={
          category.headerMode === "MINIMAL"
            ? "pt-6"
            : category.headerMode === "COMPACT" || !tiles
              ? "pt-10 md:pt-12"
              : undefined
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
                  {titleInCatalogContent ? (
                    <VStack gap="lg">
                      <CategoryBreadcrumbs breadcrumbs={breadcrumbs} />
                      <VStack gap="md">
                        {category.headerMode === "MINIMAL" ? (
                          <Heading variant="h2" renderAs="h1">
                            {title}
                          </Heading>
                        ) : (
                          <Heading variant="h1">{title}</Heading>
                        )}
                        {category.headerMode === "COMPACT" && category.shortDescription ? (
                          <Text variant="large" color="supplementary">
                            {typo(category.shortDescription)}
                          </Text>
                        ) : null}
                      </VStack>
                      {!hasRequestQuoteSection ? <div>{ctaButton}</div> : null}
                    </VStack>
                  ) : null}
                  {tiles}
                  {cards}
                  {sections}
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
        {pageBlocksInFlow.map(renderPageBlockSlot)}
      </VStack>
      {hasTrailingContacts && category.showContacts ? <Contacts /> : null}
    </HydrateClient>
  );
}
