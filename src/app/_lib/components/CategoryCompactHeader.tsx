import { typo } from "lib";
import { Fragment } from "react";

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
};

/** Компактная шапка категории: хлебные крошки + заголовок + короткое описание (headerMode = COMPACT). */
export const CategoryCompactHeader = ({ title, description, breadcrumbs }: CategoryCompactHeaderProps) => (
  <div className="border-b">
    <Container className="py-10 md:py-12">
      <VStack gap="lg">
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
          <Heading variant="h1">{typo(title)}</Heading>
          {description ? (
            <div className="max-w-3xl">
              <Text variant="large" color="supplementary">
                {typo(description)}
              </Text>
            </div>
          ) : null}
        </VStack>
      </VStack>
    </Container>
  </div>
);
