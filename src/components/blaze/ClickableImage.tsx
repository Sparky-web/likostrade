"use client";

import { typo } from "lib";
import Image, { type ImageProps } from "next/image";

import { cn } from "~/components/utils/cn";

import { Link } from "./Link";

export type ClickableImageProps = ImageProps & {
  /** Классы для `next/image` (не для обёртки-ссылки). */
  imageClassName?: string;
};

/** Строка URL или путь из статического импорта (`StaticImageData` / `StaticRequire`). */
function imageSrcToHref(src: ImageProps["src"]): string {
  if (typeof src === "string") {
    return src;
  }
  const data = "default" in src ? src.default : src;
  return data.src;
}

/**
 * `next/image` с hover scale; по клику открывает ресурс изображения в новой вкладке.
 */
export function ClickableImage({ className, imageClassName, onClick, alt, ...imageProps }: ClickableImageProps) {
  const href = imageSrcToHref(imageProps.src);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event as unknown as React.MouseEvent<HTMLImageElement>);
  };

  const ariaLabel = alt ? typo(`Открыть в новой вкладке: ${alt}`) : typo(`Открыть в новой вкладке`);

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "group relative block cursor-pointer overflow-hidden outline-offset-2",
        imageProps.fill && "h-full w-full",
        className,
      )}
      aria-label={ariaLabel}
    >
      <Image
        {...imageProps}
        alt={alt}
        className={cn(
          "h-full object-cover object-center transition-transform duration-300 group-hover:scale-105",
          imageClassName,
        )}
      />
    </Link>
  );
}
