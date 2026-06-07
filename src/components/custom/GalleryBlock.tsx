"use client";
import type { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";

import { Heading } from "../blaze/Heading";
import { VStack } from "../blaze/VStack";
import { useAdaptive } from "../hooks/useAdaptive";

interface GalleryBlockProps {
  href: string;
  /** Плейсхолдер, если нет `uploadSrc`. */
  image: StaticImageData;
  title: string;
  /** Обложка из `public/uploads` (строка из БД: `imageId`). */
  uploadSrc?: `/uploads/${string}`;
}

export const GalleryBlock = ({ image, title, href, uploadSrc }: GalleryBlockProps) => {
  const { isMobile } = useAdaptive();
  const src = uploadSrc ?? image;
  return (
    <Link href={href} className="block">
      <VStack className="group relative min-h-[300px] overflow-hidden p-6" align="end">
        <Image src={src} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(195deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_72%,rgb(0,0,0)_100%)]"
          aria-hidden
        />
        <VStack className="relative">
          <Heading variant="h2" breakWords={isMobile}>
            {title}
          </Heading>
        </VStack>
      </VStack>
    </Link>
  );
};
