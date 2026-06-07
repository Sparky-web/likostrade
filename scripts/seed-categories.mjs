/**
 * Загрузка категорий ООО «Ликос» из prisma/data/categories/*.json в таблицу Category.
 *
 * Запуск: pnpm run db:seed:categories
 *
 * Формат JSON:
 * - Корень: { "category": { id, title, landingTitle?, shortDescription?, htmlDescription?, imageFileId?, isHidden? }, "subcategories": [...] }
 * - У узла в subcategories допускается вложенность: свойство subcategories — дочерние категории.
 * - Файл categoryImagePrompts.json в том же каталоге посевом не обрабатывается (промпты для генерации изображений).
 *
 * Опции:
 *   --purge-likos — удалить только категории с id с префиксом likos_; видео отвязываются; ошибка, если Project ссылается на likos_.
 *   --replace-all — полная замена чужих категорий (см. предыдущую реализацию).
 *   --purge-non-likos — удалить все категории, в id которых нет подстроки «likos» (без учёта регистра); проекты → резервная likos-категория.
 */

import { access, copyFile, mkdir, readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "../generated/prisma/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const dataDir = join(repoRoot, "prisma/data/categories");
const imagesSourceDir = join(dataDir, "images");

/** Префикс id категорий из JSON посева */
const LIKOS_PREFIX = "likos_";

/**
 * Резервная категория для проектов после очистки старых категорий (M2M categories у Project).
 * Должна совпадать с id корневой категории из metallokonstruktsii.json.
 */
const FALLBACK_PROJECT_CATEGORY_ID = "likos_cat_metallokonstruktsii";

const prisma = new PrismaClient();

/**
 * @param {unknown} data
 */
function parseRootFile(data) {
  if (typeof data !== "object" || data === null || !("category" in data)) {
    throw new Error("Ожидается объект с полем category");
  }
  const category = /** @type {Record<string, unknown>} */ (data.category);
  const subcategories = Array.isArray(data.subcategories)
    ? /** @type {Record<string, unknown>[]} */ (data.subcategories)
    : [];
  return { category, subcategories };
}

/**
 * @param {Record<string, unknown>} row
 */
function assertCategoryRow(row, label) {
  if (typeof row.id !== "string" || !row.id.trim()) {
    throw new Error(`${label}: поле id должно быть непустой строкой`);
  }
  if (typeof row.title !== "string" || !row.title.trim()) {
    throw new Error(`${label}: поле title должно быть непустой строкой`);
  }
}

/** Рекурсивно собирает id всех категорий из узла дерева (без корневого category файла). */
function walkExpectedIdsNode(node, /** @type {Set<string>} */ acc) {
  acc.add(node.id);
  const nested = Array.isArray(node.subcategories) ? node.subcategories : [];
  for (const child of nested) {
    walkExpectedIdsNode(child, acc);
  }
}

/**
 * Все id категорий, описанные в JSON посева (для удаления устаревших likos_ записей).
 */
async function collectExpectedIdsFromDisk() {
  const names = await loadSortedJsonNames();
  const acc = new Set();
  for (const name of names) {
    const data = parseRootFile(JSON.parse(await readFile(join(dataDir, name), "utf8")));
    acc.add(data.category.id);
    for (const item of data.subcategories) {
      walkExpectedIdsNode(item, acc);
    }
  }
  return acc;
}

/** Копирует картинку в uploads и upsert File; возвращает id файла или null. */
async function ensureCategoryImageFile(/** @type {string | null | undefined} */ imageFileId) {
  if (typeof imageFileId !== "string" || !imageFileId.trim()) {
    return null;
  }
  const safeName = imageFileId.replace(/[/\\\\]/g, "");
  const src = join(imagesSourceDir, safeName);
  try {
    await access(src);
  } catch {
    // eslint-disable-next-line no-console -- CLI-скрипт
    console.warn(`Пропуск изображения (нет файла): ${src}`);
    return null;
  }

  const destDir = join(repoRoot, "public/uploads");
  await mkdir(destDir, { recursive: true });
  const dest = join(destDir, safeName);
  await copyFile(src, dest);

  await prisma.file.upsert({
    where: { id: safeName },
    create: { id: safeName, alt: null },
    update: {},
  });
  return safeName;
}

function optionalString(/** @type {unknown} */ v) {
  if (typeof v === "string") return v;
  if (v == null) return null;
  return String(v);
}

function descriptionFromRow(/** @type {Record<string, unknown>} */ row) {
  return optionalString(row.htmlDescription);
}

/**
 * Рекурсивный upsert: сначала потомки, затем узел с связью subcategories.
 * @param {Record<string, unknown>} catRaw поля категории (включая imageFileId); без вложенных subcategories на корне файла для корня дерева передаётся отдельно
 * @param {Record<string, unknown>[]} subsRaw
 * @param {string} label
 */
async function upsertCategoryTree(catRaw, subsRaw, label) {
  assertCategoryRow(catRaw, `${label}: category`);
  const nested = subsRaw ?? [];

  for (let i = 0; i < nested.length; i++) {
    const item = nested[i];
    const itemSubs = Array.isArray(item.subcategories) ? item.subcategories : [];
    const { subcategories: _, ...childFields } = item;
    await upsertCategoryTree(childFields, itemSubs, `${label}.sub[${i}]`);
  }

  const imageFileId = typeof catRaw.imageFileId === "string" ? catRaw.imageFileId : null;
  const imageId = await ensureCategoryImageFile(imageFileId);

  const category = {
    id: /** @type {string} */ (catRaw.id),
    title: /** @type {string} */ (catRaw.title),
    landingTitle: optionalString(catRaw.landingTitle ?? catRaw.heroSubtitle),
    shortDescription: optionalString(catRaw.shortDescription),
    htmlDescription: descriptionFromRow(catRaw),
    imageId,
    isHidden: catRaw.isHidden === true,
  };

  const childIds = nested.map((c) => /** @type {string} */ (c.id));

  await prisma.category.upsert({
    where: { id: category.id },
    create: {
      ...category,
      ...(childIds.length > 0 ? { subcategories: { connect: childIds.map((id) => ({ id })) } } : {}),
    },
    update: {
      title: category.title,
      landingTitle: category.landingTitle,
      shortDescription: category.shortDescription,
      htmlDescription: category.htmlDescription,
      imageId: category.imageId,
      isHidden: category.isHidden,
      ...(childIds.length > 0
        ? { subcategories: { set: childIds.map((id) => ({ id })) } }
        : { subcategories: { set: [] } }),
    },
  });
}

/** Привязывает все проекты только к одной категории (после purge чужих категорий). */
async function setAllProjectsCategories(tx, categoryId) {
  const projects = await tx.project.findMany({ select: { id: true } });
  for (const { id } of projects) {
    await tx.project.update({
      where: { id },
      data: { categories: { set: [{ id: categoryId }] } },
    });
  }
}

/** Отвязывает у видео категории из переданного списка id (остальные связи сохраняются). */
async function disconnectVideosFromCategoryIds(tx, categoryIds) {
  if (categoryIds.length === 0) return;

  const videos = await tx.video.findMany({
    where: { categories: { some: { id: { in: categoryIds } } } },
    select: { id: true, categories: { select: { id: true } } },
  });

  for (const video of videos) {
    const remaining = video.categories.map((category) => category.id).filter((id) => !categoryIds.includes(id));
    await tx.video.update({
      where: { id: video.id },
      data: { categories: { set: remaining.map((id) => ({ id })) } },
    });
  }
}

/** Снимает все категории со всех видео. */
async function clearAllVideoCategories(tx) {
  const videos = await tx.video.findMany({ select: { id: true } });
  for (const { id } of videos) {
    await tx.video.update({
      where: { id },
      data: { categories: { set: [] } },
    });
  }
}

async function purgeLikosCategories() {
  await prisma.$transaction(async (tx) => {
    const likosCategories = await tx.category.findMany({
      where: { id: { startsWith: LIKOS_PREFIX } },
      select: { id: true },
    });
    await disconnectVideosFromCategoryIds(
      tx,
      likosCategories.map((category) => category.id),
    );

    const projectRefs = await tx.project.findFirst({
      where: { categories: { some: { id: { startsWith: LIKOS_PREFIX } } } },
      select: { id: true, title: true },
    });
    if (projectRefs) {
      throw new Error(
        `Нельзя выполнить purge: проект «${projectRefs.title}» (${projectRefs.id}) ссылается на категорию likos_. Переназначьте категорию проекта в админке.`,
      );
    }

    const deleted = await tx.category.deleteMany({
      where: { id: { startsWith: LIKOS_PREFIX } },
    });
    // eslint-disable-next-line no-console -- CLI-скрипт
    console.info(`Удалено категорий likos_: ${deleted.count}`);
  });
}

async function replaceAllCategories() {
  const fallback = await prisma.category.findUnique({
    where: { id: FALLBACK_PROJECT_CATEGORY_ID },
    select: { id: true },
  });
  if (!fallback) {
    throw new Error(
      `Резервная категория ${FALLBACK_PROJECT_CATEGORY_ID} не найдена. Сначала должен выполниться посев JSON.`,
    );
  }

  await prisma.$transaction(async (tx) => {
    await clearAllVideoCategories(tx);

    await setAllProjectsCategories(tx, FALLBACK_PROJECT_CATEGORY_ID);

    const files = await tx.file.findMany({ select: { id: true } });
    for (const { id } of files) {
      await tx.file.update({
        where: { id },
        data: { categories: { set: [] } },
      });
    }

    const deleted = await tx.category.deleteMany({
      where: { NOT: { id: { startsWith: LIKOS_PREFIX } } },
    });
    // eslint-disable-next-line no-console -- CLI-скрипт
    console.info(
      `Очистка: проекты переведены на «${FALLBACK_PROJECT_CATEGORY_ID}», отвязаны видео и файлы; удалено старых категорий: ${deleted.count}`,
    );
  });
}

/** Удаляет категории, в id которых нет подстроки «likos» (регистронезависимо). */
async function purgeCategoriesWithoutLikosInId() {
  const fallback = await prisma.category.findUnique({
    where: { id: FALLBACK_PROJECT_CATEGORY_ID },
    select: { id: true },
  });
  if (!fallback) {
    throw new Error(
      `Нет резервной категории ${FALLBACK_PROJECT_CATEGORY_ID}. Сначала выполните: pnpm run db:seed:categories`,
    );
  }

  const victims = await prisma.category.findMany({
    where: {
      NOT: {
        id: { contains: "likos", mode: "insensitive" },
      },
    },
    select: { id: true },
  });
  const ids = victims.map((v) => v.id);
  if (ids.length === 0) {
    // eslint-disable-next-line no-console -- CLI-скрипт
    console.info("Категорий без подстроки «likos» в id не найдено.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    await disconnectVideosFromCategoryIds(tx, ids);

    const affectedProjects = await tx.project.findMany({
      where: { categories: { some: { id: { in: ids } } } },
      select: { id: true },
    });
    for (const { id } of affectedProjects) {
      await tx.project.update({
        where: { id },
        data: { categories: { set: [{ id: FALLBACK_PROJECT_CATEGORY_ID }] } },
      });
    }

    for (const bid of ids) {
      const files = await tx.file.findMany({
        where: { categories: { some: { id: bid } } },
        select: { id: true },
      });
      for (const { id } of files) {
        await tx.file.update({
          where: { id },
          data: { categories: { disconnect: { id: bid } } },
        });
      }
    }

    for (const id of ids) {
      await tx.category.update({
        where: { id },
        data: {
          subcategories: { set: [] },
          parentCategories: { set: [] },
        },
      });
    }

    const deleted = await tx.category.deleteMany({
      where: { id: { in: ids } },
    });
    // eslint-disable-next-line no-console -- CLI-скрипт
    console.info(`Удалено категорий без «likos» в id: ${deleted.count}`);
  });
}

/** Удаляет likos-категории, которых нет в актуальном наборе JSON (например, бывший корень обсадных фильтров). */
async function removeOrphanLikosCategories(/** @type {Set<string>} */ expectedIds) {
  const allLikos = await prisma.category.findMany({
    where: { id: { startsWith: LIKOS_PREFIX } },
    select: { id: true },
  });
  const orphanIds = allLikos.map((r) => r.id).filter((id) => !expectedIds.has(id));
  if (orphanIds.length === 0) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await disconnectVideosFromCategoryIds(tx, orphanIds);

    const orphanProjects = await tx.project.findMany({
    where: { categories: { some: { id: { in: orphanIds } } } },
    select: { id: true },
  });
    for (const { id } of orphanProjects) {
      await tx.project.update({
        where: { id },
        data: { categories: { set: [{ id: FALLBACK_PROJECT_CATEGORY_ID }] } },
      });
    }

    await tx.category.deleteMany({ where: { id: { in: orphanIds } } });
  });
  // eslint-disable-next-line no-console -- CLI-скрипт
  console.info(`Удалены устаревшие likos-категории (${orphanIds.length}): ${orphanIds.join(", ")}`);
}

async function seedOneFile(/** @type {string} */ name, /** @type {string} */ jsonRaw) {
  const data = parseRootFile(JSON.parse(jsonRaw));
  await upsertCategoryTree(data.category, data.subcategories, `Файл ${name}`);
  const totalSubs = countSubs(data.subcategories);
  // eslint-disable-next-line no-console -- CLI-скрипт
  console.info(`OK: ${name} → «${data.category.title}» (узлов в дереве под корнем: ${totalSubs})`);
}

function countSubs(/** @type {Record<string, unknown>[]} */ subs) {
  let n = subs.length;
  for (const s of subs) {
    const ch = Array.isArray(s.subcategories) ? s.subcategories : [];
    n += countSubs(ch);
  }
  return n;
}

async function loadSortedJsonNames() {
  const names = (await readdir(dataDir))
    .filter((n) => n.endsWith(".json") && n !== "categoryImagePrompts.json")
    .sort();
  if (names.length === 0) {
    throw new Error(`В каталоге нет JSON: ${dataDir}`);
  }
  return names;
}

async function seedFromDisk() {
  const expectedIds = await collectExpectedIdsFromDisk();
  const names = await loadSortedJsonNames();
  for (const name of names) {
    const jsonRaw = await readFile(join(dataDir, name), "utf8");
    await seedOneFile(name, jsonRaw);
  }
  await removeOrphanLikosCategories(expectedIds);
  return names.length;
}

async function main() {
  const purgeLikos = process.argv.includes("--purge-likos");
  const replaceAll = process.argv.includes("--replace-all");
  const purgeNonLikos = process.argv.includes("--purge-non-likos");

  const modes = [purgeLikos, replaceAll, purgeNonLikos].filter(Boolean).length;
  if (modes > 1) {
    throw new Error("Укажите только один режим: --purge-likos, --replace-all или --purge-non-likos");
  }

  if (purgeNonLikos) {
    await purgeCategoriesWithoutLikosInId();
    return;
  }

  if (purgeLikos) {
    await purgeLikosCategories();
    const n = await seedFromDisk();
    // eslint-disable-next-line no-console -- CLI-скрипт
    console.info(`Готово: обработано файлов ${n}`);
    return;
  }

  if (replaceAll) {
    // eslint-disable-next-line no-console -- CLI-скрипт
    console.info("Режим --replace-all: посев likos, затем удаление прочих категорий и повторный посев.");
    await seedFromDisk();
    await replaceAllCategories();
    const n = await seedFromDisk();
    // eslint-disable-next-line no-console -- CLI-скрипт
    console.info(`Готово: полная замена, обработано файлов ${n} (два прохода посева)`);
    return;
  }

  const n = await seedFromDisk();
  // eslint-disable-next-line no-console -- CLI-скрипт
  console.info(`Готово: обработано файлов ${n}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
