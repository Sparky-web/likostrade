/**
 * Удаляет «осиротевшие» файлы:
 * 1. Записи File, на которые нет ни одной ссылки, — из БД и с диска.
 * 2. Файлы в public/uploads, которых нет в таблице File и на которые нет ссылок из контента.
 *
 * Ссылкой считается: реляция (Category.image, Project.mainImage, Project.additionalImages,
 * Lead.files) ЛИБО упоминание в контенте — Category.sections (fileId файловых секций и
 * `/uploads/…` внутри HTML) и rich-HTML поля Project (task, workProgress, result).
 *
 * Обход JSON продублирован из src/sections/schema.ts (collectUploadReferences) — скрипт
 * plain JS и не может импортировать TS; менять синхронно.
 *
 * Запуск: pnpm run db:cleanup:orphan-files
 */

import { readdir, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "../generated/prisma/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const uploadsDir = join(repoRoot, "public/uploads");

const prisma = new PrismaClient();

/** @param {string} fileId */
function uploadPath(fileId) {
  const safeName = fileId.replace(/[/\\]/g, "");
  if (safeName !== fileId) {
    throw new Error(`Недопустимый id файла: ${fileId}`);
  }
  return join(uploadsDir, safeName);
}

/** @param {string} fileId */
async function removeUploadFile(fileId) {
  const filePath = uploadPath(fileId);
  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      // eslint-disable-next-line no-console -- CLI-скрипт
      console.warn(`Пропуск (не файл): ${filePath}`);
      return false;
    }
    await rm(filePath);
    return true;
  } catch (err) {
    if (/** @type {NodeJS.ErrnoException} */ (err).code === "ENOENT") {
      return false;
    }
    throw err;
  }
}

/**
 * Собирает упоминания файлов из public/uploads в произвольном JSON/строке:
 * значения ключей fileId и `/uploads/…`-ссылки внутри строк (включая HTML).
 * Копия collectUploadReferences из src/sections/schema.ts.
 *
 * @param {unknown} value
 * @param {Set<string>} into
 */
function collectUploadReferences(value, into) {
  if (typeof value === "string") {
    for (const match of value.matchAll(/\/uploads\/([^"'\n<>?#]+)/g)) {
      const name = match[1]?.trim();
      if (!name) continue;
      into.add(name);
      try {
        into.add(decodeURIComponent(name));
      } catch {
        // не URI-кодировано — сырого имени достаточно
      }
    }
    return into;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectUploadReferences(item, into);
    return into;
  }
  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      if ((key === "fileId" || key === "imageId") && typeof nested === "string") into.add(nested);
      else collectUploadReferences(nested, into);
    }
  }
  return into;
}

/** Имена файлов, на которые ссылается контент (секции категорий и rich-HTML проектов). */
async function collectContentReferences() {
  const referenced = new Set();

  const categories = await prisma.category.findMany({ select: { sections: true } });
  for (const { sections } of categories) {
    collectUploadReferences(sections, referenced);
  }

  const projects = await prisma.project.findMany({
    select: { task: true, workProgress: true, result: true },
  });
  for (const project of projects) {
    collectUploadReferences(project.task, referenced);
    collectUploadReferences(project.workProgress, referenced);
    collectUploadReferences(project.result, referenced);
  }

  return referenced;
}

/** @param {Set<string>} contentReferences */
async function collectOrphanFileIds(contentReferences) {
  const files = await prisma.file.findMany({
    select: {
      id: true,
      _count: {
        select: {
          categories: true,
          projectMainImages: true,
          projectAdditionalImages: true,
          leadAttachments: true,
        },
      },
    },
  });

  return files
    .filter(
      ({ id, _count }) =>
        _count.categories === 0 &&
        _count.projectMainImages === 0 &&
        _count.projectAdditionalImages === 0 &&
        _count.leadAttachments === 0 &&
        !contentReferences.has(id),
    )
    .map(({ id }) => id);
}

async function main() {
  const contentReferences = await collectContentReferences();
  const orphanDbIds = await collectOrphanFileIds(contentReferences);

  let removedFromDiskByDb = 0;
  for (const id of orphanDbIds) {
    if (await removeUploadFile(id)) {
      removedFromDiskByDb += 1;
    }
  }

  const deletedFromDb =
    orphanDbIds.length > 0
      ? (await prisma.file.deleteMany({ where: { id: { in: orphanDbIds } } })).count
      : 0;

  const dbIds = new Set(
    (await prisma.file.findMany({ select: { id: true } })).map(({ id }) => id),
  );

  let diskOnlyRemoved = 0;
  let diskEntries = [];
  try {
    diskEntries = await readdir(uploadsDir);
  } catch (err) {
    if (/** @type {NodeJS.ErrnoException} */ (err).code !== "ENOENT") {
      throw err;
    }
  }

  for (const name of diskEntries) {
    if (dbIds.has(name) || contentReferences.has(name)) continue;
    const filePath = join(uploadsDir, name);
    const info = await stat(filePath);
    if (!info.isFile()) continue;
    await rm(filePath);
    diskOnlyRemoved += 1;
  }

  // eslint-disable-next-line no-console -- CLI-скрипт
  console.log(
    [
      `Ссылок на файлы из контента: ${contentReferences.size}`,
      `Удалено записей File без связей и упоминаний: ${deletedFromDb}`,
      `Удалено файлов с диска (по осиротевшим записям): ${removedFromDiskByDb}`,
      `Удалено файлов с диска без записи в БД и упоминаний: ${diskOnlyRemoved}`,
    ].join("\n"),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
