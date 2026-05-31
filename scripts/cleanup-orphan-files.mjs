/**
 * Удаляет «осиротевшие» файлы:
 * 1. Записи File без связей (Category.image, Project.mainImage, Project.additionalImages) — из БД и с диска.
 * 2. Файлы в public/uploads, которых нет в таблице File.
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

async function collectOrphanFileIds() {
  const files = await prisma.file.findMany({
    select: {
      id: true,
      _count: {
        select: {
          categories: true,
          projectMainImages: true,
          projectAdditionalImages: true,
        },
      },
    },
  });

  return files
    .filter(
      ({ _count }) =>
        _count.categories === 0 &&
        _count.projectMainImages === 0 &&
        _count.projectAdditionalImages === 0,
    )
    .map(({ id }) => id);
}

async function main() {
  const orphanDbIds = await collectOrphanFileIds();

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
    if (dbIds.has(name)) continue;
    const filePath = join(uploadsDir, name);
    const info = await stat(filePath);
    if (!info.isFile()) continue;
    await rm(filePath);
    diskOnlyRemoved += 1;
  }

  // eslint-disable-next-line no-console -- CLI-скрипт
  console.log(
    [
      `Удалено записей File без связей: ${deletedFromDb}`,
      `Удалено файлов с диска (по осиротевшим записям): ${removedFromDiskByDb}`,
      `Удалено файлов с диска без записи в БД: ${diskOnlyRemoved}`,
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
