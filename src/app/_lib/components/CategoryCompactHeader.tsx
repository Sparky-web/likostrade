import { typo } from "lib";
import { Fragment, type ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Container,
  Heading,
  Text,
  VStack,
} from "~/components";

export type BreadcrumbEntry = {
  title: string;
  /** Без href — текущая страница (BreadcrumbPage). */
  href?: string;
};

type CategoryCompactHeaderProps = {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbEntry[];
  /**
   * minimal — страницы позиций каталога: заголовок меньше, без подзаголовка,
   * минимальный отступ до контента (как карточка товара на evraz.pro).
   */
  variant?: "compact" | "minimal";
  /** CTA-кнопка под заголовком (заявка/запрос цены) — чтобы призыв был над сгибом. */
  cta?: ReactNode;
};

/** Компактная шапка категории: хлебные крошки + заголовок (+ описание в compact-варианте) + CTA. */
export const CategoryCompactHeader = ({ title, description, breadcrumbs, variant = "compact", cta }: CategoryCompactHeaderProps) => {
  const isMinimal = variant === "minimal";

  return (
    <div className={isMinimal ? undefined : "border-b"}>
      <Container className={isMinimal ? "pt-8 pb-2 md:pt-10" : "py-10 md:py-12"}>
        <VStack gap={isMinimal ? "md" : "lg"}>
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <Fragment key={index}>
                  {index > 0 ? <BreadcrumbSeparator /> : null}
                  <BreadcrumbItem>
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>{typo(crumb.title)}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{typo(crumb.title)}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <VStack gap="md">
            {isMinimal ? (
              <Heading variant="h2" renderAs="h1">
                {typo(title)}
              </Heading>
            ) : (
              <Heading variant="h1">{typo(title)}</Heading>
            )}
            {!isMinimal && description ? (
              <div className="max-w-3xl">
                <Text variant="large" color="supplementary">
                  {typo(description)}
                </Text>
              </div>
            ) : null}
          </VStack>
          {cta ? <div>{cta}</div> : null}
        </VStack>
      </Container>
    </div>
  );
};
