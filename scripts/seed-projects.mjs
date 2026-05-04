/**
 * Загрузка проектов портфолио из prisma/data/projects/portfolio-export-…/projects.json.
 *
 * Запуск: pnpm run db:seed:projects
 *
 * Обрабатываются все подкаталоги prisma/data/projects с префиксом portfolio-export
 * (portfolio-export, portfolio-export-shit, …), в каждом ожидается projects.json и .jpg.
 *
 * Формат JSON — массив объектов Project (см. prisma/schema.prisma):
 * id, title, dateCompleted (YYYY-MM-DD), shortDescription?, price?, timeToComplete?,
 * task?, workProgress?, result?, mainImageId?, additionalImages?, categories?, isHidden?
 *
 * Опции:
 *   --purge-likos — удалить проекты с id likos_proj_* перед посевом.
 */

import { access, copyFile, mkdir, readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "../generated/prisma/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const projectsDataRoot = join(repoRoot, "prisma/data/projects");
const uploadsDir = join(repoRoot, "public/uploads");

/** Префикс id проектов из JSON посева */
const LIKOS_PROJECT_PREFIX = "likos_proj_";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const prisma = new PrismaClient();

function optionalString(/** @type {unknown} */ v) {
  if (typeof v === "string") return v.trim() ? v : null;
  if (v == null) return null;
  return String(v);
}

function optionalStringArray(/** @type {unknown} */ v) {
  if (!Array.isArray(v)) return [];
  return v.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim());
}

/**
 * @param {Record<string, unknown>} row
 * @param {string} label
 */
function assertProjectRow(row, label) {
  if (typeof row.id !== "string" || !row.id.trim()) {
    throw new Error(`${label}: поле id должно быть непустой строкой`);
  }
  if (typeof row.title !== "string" || !row.title.trim()) {
    throw new Error(`${label}: поле title должно быть непустой строкой`);
  }
  if (typeof row.dateCompleted !== "string" || !ISO_DATE_PATTERN.test(row.dateCompleted)) {
    throw new Error(`${label}: dateCompleted должна быть строкой YYYY-MM-DD`);
  }
}

/** Каталоги portfolio-export* с projects.json. */
async function loadProjectExportSources() {
  const entries = await readdir(projectsDataRoot, { withFileTypes: true });
  const sources = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("portfolio-export")) continue;

    const dir = join(projectsDataRoot, entry.name);
    const jsonPath = join(dir, "projects.json");
    try {
      await access(jsonPath);
    } catch {
      // eslint-disable-next-line no-console -- CLI-скрипт
      console.warn(`Пропуск ${entry.name}: нет projects.json`);
      continue;
    }
    sources.push({ name: entry.name, dir, jsonPath });
  }

  sources.sort((a, b) => a.name.localeCompare(b.name));
  if (sources.length === 0) {
    throw new Error(`Нет каталогов portfolio-export* с projects.json в ${projectsDataRoot}`);
  }
  return sources;
}

/** Копирует картинку в uploads и upsert File; возвращает id или null. */
async function ensureProjectImageFile(
  /** @type {string} */ imagesDir,
  /** @type {string | null | undefined} */ imageFileId,
) {
  if (typeof imageFileId !== "string" || !imageFileId.trim()) {
    return null;
  }
  const safeName = imageFileId.replace(/[/\\\\]/g, "");
  const src = join(imagesDir, safeName);
  try {
    await access(src);
  } catch {
    // eslint-disable-next-line no-console -- CLI-скрипт
    console.warn(`Пропуск изображения (нет файла): ${src}`);
    return null;
  }

  await mkdir(uploadsDir, { recursive: true });
  await copyFile(src, join(uploadsDir, safeName));

  await prisma.file.upsert({
    where: { id: safeName },
    create: { id: safeName, alt: null },
    update: {},
  });
  return safeName;
}

async function assertCategoriesExist(/** @type {string[]} */ categoryIds) {
  if (categoryIds.length === 0) return;
  const found = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true },
  });
  const foundSet = new Set(found.map((c) => c.id));
  const missing = categoryIds.filter((id) => !foundSet.has(id));
  if (missing.length > 0) {
    throw new Error(`Категории не найдены в БД: ${missing.join(", ")}. Сначала: pnpm run db:seed:categories`);
  }
}

/**
 * @param {Record<string, unknown>} row
 * @param {string} imagesDir
 */
async function upsertProject(row, imagesDir) {
  const categoryIds = optionalStringArray(row.categories);
  await assertCategoriesExist(categoryIds);

  const additionalImageIds = optionalStringArray(row.additionalImages);
  const mainImageId = await ensureProjectImageFile(
    imagesDir,
    typeof row.mainImageId === "string" ? row.mainImageId : null,
  );

  for (const imageId of additionalImageIds) {
    await ensureProjectImageFile(imagesDir, imageId);
  }

  const project = {
    id: /** @type {string} */ (row.id),
    title: /** @type {string} */ (row.title),
    shortDescription: optionalString(row.shortDescription),
    dateCompleted: /** @type {string} */ (row.dateCompleted),
    price: optionalString(row.price),
    timeToComplete: optionalString(row.timeToComplete),
    task: optionalString(row.task),
    workProgress: optionalString(row.workProgress),
    result: optionalString(row.result),
    isHidden: row.isHidden === true,
    mainImageId,
  };

  const categoryConnect = categoryIds.map((id) => ({ id }));
  const imageConnect = additionalImageIds.map((id) => ({ id }));

  await prisma.project.upsert({
    where: { id: project.id },
    create: {
      ...project,
      categories: categoryConnect.length ? { connect: categoryConnect } : undefined,
      additionalImages: imageConnect.length ? { connect: imageConnect } : undefined,
    },
    update: {
      ...project,
      categories: { set: categoryConnect },
      additionalImages: { set: imageConnect },
    },
  });
}

/** Удаляет likos_proj_* записи, которых нет в актуальных JSON. */
async function removeOrphanLikosProjects(/** @type {Set<string>} */ expectedIds) {
  const allLikos = await prisma.project.findMany({
    where: { id: { startsWith: LIKOS_PROJECT_PREFIX } },
    select: { id: true },
  });
  const orphanIds = allLikos.map((r) => r.id).filter((id) => !expectedIds.has(id));
  if (orphanIds.length === 0) return;

  await prisma.project.deleteMany({ where: { id: { in: orphanIds } } });
  // eslint-disable-next-line no-console -- CLI-скрипт
  console.info(`Удалены устаревшие likos-проекты (${orphanIds.length}): ${orphanIds.join(", ")}`);
}

async function purgeLikosProjects() {
  const deleted = await prisma.project.deleteMany({
    where: { id: { startsWith: LIKOS_PROJECT_PREFIX } },
  });
  // eslint-disable-next-line no-console -- CLI-скрипт
  console.info(`Удалено проектов likos_proj_*: ${deleted.count}`);
}

/**
 * @param {{ name: string, dir: string, jsonPath: string }} source
 */
async function loadProjectsFromSource(source) {
  const raw = await readFile(source.jsonPath, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`${source.name}/projects.json должен содержать массив проектов`);
  }
  return /** @type {Record<string, unknown>[]} */ (data);
}

/**
 * @param {{ name: string, dir: string, jsonPath: string }} source
 * @param {Set<string>} expectedIds
 */
async function seedOneSource(source, expectedIds) {
  const rows = await loadProjectsFromSource(source);
  const names = await readdir(source.dir);
  const imageCount = names.filter((n) => n.endsWith(".jpg")).length;

  // eslint-disable-next-line no-console -- CLI-скрипт
  console.info(`--- ${source.name}: проектов ${rows.length}, jpg ${imageCount} ---`);

  for (let i = 0; i < rows.length; i++) {
    const label = `${source.name}[${i}]`;
    assertProjectRow(rows[i], label);
    const id = /** @type {string} */ (rows[i].id);
    if (expectedIds.has(id)) {
      throw new Error(`Дублирующийся id проекта «${id}» в ${source.name}`);
    }
    expectedIds.add(id);
    await upsertProject(rows[i], source.dir);
    // eslint-disable-next-line no-console -- CLI-скрипт
    console.info(`OK: ${id} → «${rows[i].title}»`);
  }

  return rows.length;
}

async function seedFromDisk() {
  const sources = await loadProjectExportSources();
  const expectedIds = new Set();
  let total = 0;

  for (const source of sources) {
    total += await seedOneSource(source, expectedIds);
  }

  await removeOrphanLikosProjects(expectedIds);
  return { total, sources: sources.length };
}

async function main() {
  const purgeLikos = process.argv.includes("--purge-likos");

  if (purgeLikos) {
    await purgeLikosProjects();
  }

  const { total, sources } = await seedFromDisk();
  // eslint-disable-next-line no-console -- CLI-скрипт
  console.info(`Готово: проектов ${total} из ${sources} каталог(ов) portfolio-export*`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
