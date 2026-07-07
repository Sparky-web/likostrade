"use client";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import { type ReactNode } from "react";

import { Container } from "../blaze/Container";
import { Heading } from "../blaze/Heading";
import { Text } from "../blaze/Text";
import { VStack } from "../blaze/VStack";
import { useAdaptive } from "../hooks/useAdaptive";

interface HeadlineProps {
  title: ReactNode;
  /** Краткое описание под заголовком (например `shortDescription` категории). */
  description?: ReactNode;
  button?: ReactNode;
  /** Фон по умолчанию, если нет `uploadSrc`. */
  image?: StaticImageData;
  /** Фон из `public/uploads` (приоритетнее `image`). */
  uploadSrc?: `/uploads/${string}`;
}

export const Headline = ({ title, description, button, image, uploadSrc }: HeadlineProps) => {
  const { isMobile } = useAdaptive();
  const bgSrc = uploadSrc ?? image;
  const textAlign = isMobile ? "left" : "center";

  return (
    // При наличии фото — тёмная «героическая» полоса: класс dark делает оверлей тёмным, а text-foreground
    // задаёт светлый цвет текста (наследуется в Heading/Text). Шапка вне hero — остаётся светлой и читаемой.
    <div className={`relative${bgSrc ? " dark text-foreground" : ""}`}>
      {bgSrc && (
        <div className="absolute inset-0 overflow-hidden">
          <Image src={bgSrc} alt="" fill className="object-cover" priority sizes="100vw" />
          <div className="bg-gradient-to-t from-background/85 to-background/60 absolute h-full w-full"></div>
        </div>
      )}
      <Container className="relative py-20 md:py-16">
        <VStack justify={isMobile ? "start" : "center"} gap="xl">
          <Heading variant="h1" align={isMobile ? "left" : "center"} breakWords={isMobile}>
            {title}
          </Heading>
          {description ? (
            <Text align={textAlign} breakWords variant="large">
              {description}
            </Text>
          ) : null}
          {button}
        </VStack>
      </Container>
    </div>
  );
};
