import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { imageSize } from "image-size";
import { typo } from "lib";
import NextImage, { type ImageProps } from "next/image";

/**
 * Кеш intrinsic-размеров на уровне модуля: один и тот же файл из `public/uploads`
 * не перечитываем повторно между запросами в рамках жизни worker'а.
 * Файлы в `uploads` иммутабельны (имя содержит timestamp), поэтому инвалидация не нужна.
 */
const dimensionsCache = new Map<string, { width: number; height: number }>();

const PUBLIC_DIR = path.join(process.cwd(), "public");

async function readImageDimensions(publicPath: string): Promise<{ width: number; height: number }> {
  const cached = dimensionsCache.get(publicPath);
  if (cached) return cached;

  const filePath = path.join(PUBLIC_DIR, publicPath);

  // Защита от path traversal: итоговый абсолютный путь обязан остаться внутри `public/`.
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    throw new Error(typo(`Недопустимый путь изображения: ${publicPath}`));
  }

  const buffer = await readFile(filePath);
  const { width, height, orientation } = imageSize(buffer);

  // EXIF orientation 5–8 = поворот на 90°, ширина и высота меняются местами.
  const isRotated = orientation !== undefined && orientation >= 5 && orientation <= 8;
  const dimensions = isRotated ? { width: height, height: width } : { width, height };

  dimensionsCache.set(publicPath, dimensions);
  return dimensions;
}

export type UploadImageProps = Omit<ImageProps, "src" | "width" | "height" | "fill"> & {
  /** Путь к файлу в `public/uploads`, начиная с `/uploads/`. */
  src: `/uploads/${string}`;
};

/**
 * Серверная обёртка над `next/image` для файлов из `public/uploads`.
 *
 * Считывает intrinsic-размеры с диска (через `image-size`, парсит только заголовок),
 * благодаря чему ведёт себя как статический импорт: задаёт корректный `aspect-ratio`,
 * не вызывает CLS и не требует ручного указания `width`/`height`.
 *
 * Важно: для адаптивной выдачи правильной версии изображения нужно передавать `sizes`,
 * описывающий реальную ширину рендера. Без `sizes` Next.js сгенерирует srcSet под
 * полный intrinsic-width и на маленьких контейнерах может отдать оригинал.
 */
export const UploadImage = async ({ src, alt, ...rest }: UploadImageProps) => {
  const { width, height } = await readImageDimensions(src);

  return <NextImage {...rest} src={src} width={width} height={height} alt={alt} />;
};
