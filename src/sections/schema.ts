import { typo, zodRussian } from "lib";

/**
 * Схема секций контента категории (Category.sections, jsonb-массив).
 *
 * Модуль чистый (без React) — им пользуются tRPC-роутер (валидация записи),
 * публичный рендер и админка. Реестры React-компонентов секций и спец-блоков
 * живут в src/app/_lib/sections и обязаны покрывать ключи отсюда.
 */

/** Спец-блоки, задаваемые в коде: ключ → название в админке. */
export const SPECIAL_BLOCKS = {
  requestQuote: typo("Запрос цены"),
  subcategoryList: typo("Список подкатегорий"),
} as const;

export type SpecialBlockKey = keyof typeof SPECIAL_BLOCKS;

const specialBlockKeys = Object.keys(SPECIAL_BLOCKS) as [SpecialBlockKey, ...SpecialBlockKey[]];

/** Иконки секции «карточки» — курируемый сабсет lucide, чтобы не тянуть весь набор в бандл. */
export const CARD_ICON_KEYS = [
  "award",
  "badgeCheck",
  "clock",
  "cog",
  "factory",
  "flame",
  "gauge",
  "hammer",
  "handshake",
  "hardHat",
  "layers",
  "mapPin",
  "packageCheck",
  "ruler",
  "settings",
  "shieldCheck",
  "sparkles",
  "thermometer",
  "timer",
  "truck",
  "users",
  "wrench",
  "zap",
] as const;

export type CardIconKey = (typeof CARD_ICON_KEYS)[number];

/** Имя файла в public/uploads: без разделителей пути (те же правила, что uploadPath в cleanup-скрипте). */
const fileIdSchema = zodRussian
  .string()
  .min(1)
  .max(300)
  .regex(/^[^/\\]+$/, typo("Недопустимое имя файла"));

/** Хосты, чьи embed-ссылки разрешены в видео-секции (URL попадает в iframe src). */
export const VIDEO_EMBED_HOSTS = [
  "vkvideo.ru",
  "vk.com",
  "rutube.ru",
  "youtube.com",
  "www.youtube.com",
  "www.youtube-nocookie.com",
] as const;

export const videoUrlSchema = zodRussian
  .string()
  .url()
  .refine(
    (value) => {
      try {
        return (VIDEO_EMBED_HOSTS as readonly string[]).includes(new URL(value).hostname);
      } catch {
        return false;
      }
    },
    { message: typo(`Разрешены только embed-ссылки с хостов: ${VIDEO_EMBED_HOSTS.join(", ")}`) },
  );

const sectionBase = {
  /** Стабильный id секции (crypto.randomUUID на клиенте) — ключ для React и переупорядочивания. */
  id: zodRussian.string().min(1),
  /** Необязательный заголовок секции (H2 на странице). */
  title: zodRussian.string().optional(),
};

// ZodEffects (refine/superRefine) не допускается внутри discriminatedUnion, поэтому
// согласованность ширины строк table-секции обеспечивает редактор, а рендер толерантен.
const textSectionSchema = zodRussian.object({
  ...sectionBase,
  type: zodRussian.literal("text"),
  /** Простой HTML из rich-редактора админки; выводится через dangerouslySetInnerHTML. */
  html: zodRussian.string(),
});

const tableSectionSchema = zodRussian.object({
  ...sectionBase,
  type: zodRussian.literal("table"),
  headerRow: zodRussian.array(zodRussian.string()).min(1),
  rows: zodRussian.array(zodRussian.array(zodRussian.string())),
});

const filesSectionSchema = zodRussian.object({
  ...sectionBase,
  type: zodRussian.literal("files"),
  items: zodRussian.array(
    zodRussian.object({
      fileId: fileIdSchema,
      /** Подпись ссылки; без неё показывается имя файла без временно́го префикса. */
      label: zodRussian.string().optional(),
    }),
  ),
});

const videoSectionSchema = zodRussian.object({
  ...sectionBase,
  type: zodRussian.literal("video"),
  url: videoUrlSchema,
});

const cardsSectionSchema = zodRussian.object({
  ...sectionBase,
  type: zodRussian.literal("cards"),
  items: zodRussian
    .array(
      zodRussian.object({
        icon: zodRussian.enum(CARD_ICON_KEYS).optional(),
        title: zodRussian.string().min(1),
        text: zodRussian.string().optional(),
      }),
    )
    .min(1),
});

const specialSectionSchema = zodRussian.object({
  ...sectionBase,
  type: zodRussian.literal("special"),
  block: zodRussian.enum(specialBlockKeys),
});

export const categorySectionSchema = zodRussian.discriminatedUnion("type", [
  textSectionSchema,
  tableSectionSchema,
  filesSectionSchema,
  videoSectionSchema,
  cardsSectionSchema,
  specialSectionSchema,
]);

export const categorySectionsSchema = zodRussian.array(categorySectionSchema);

export type CategorySection = (typeof categorySectionSchema)["_output"];

/** Названия типов секций для админки. */
export const SECTION_TYPE_LABELS = {
  text: typo("Текст"),
  table: typo("Таблица"),
  files: typo("Файлы"),
  video: typo("Видео"),
  cards: typo("Карточки"),
  special: typo("Спец-блок"),
} as const satisfies Record<CategorySection["type"], string>;
export type TextSection = Extract<CategorySection, { type: "text" }>;
export type TableSection = Extract<CategorySection, { type: "table" }>;
export type FilesSection = Extract<CategorySection, { type: "files" }>;
export type VideoSection = Extract<CategorySection, { type: "video" }>;
export type CardsSection = Extract<CategorySection, { type: "cards" }>;
export type SpecialSection = Extract<CategorySection, { type: "special" }>;

/**
 * Читает Category.sections из БД толерантно: каждая секция валидируется отдельно,
 * невалидные и неизвестные (записанные более новым кодом) пропускаются с warn —
 * одна битая секция не роняет страницу.
 */
export function parseSections(value: unknown): CategorySection[] {
  if (!Array.isArray(value)) return [];

  const sections: CategorySection[] = [];
  for (const item of value) {
    const result = categorySectionSchema.safeParse(item);
    if (result.success) {
      sections.push(result.data);
    } else {
      console.warn(typo("Пропущена невалидная секция категории:"), result.error.issues[0]?.message, item);
    }
  }
  return sections;
}

/** Пустая строка → undefined: редактор держит опциональные поля строками, схема ждёт отсутствие значения. */
const dropEmpty = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

/**
 * Приводит состояние редактора к схеме перед отправкой: убирает пустые опциональные
 * строки (title, label, icon, text). Обязательные поля не трогает — их проверит схема.
 */
export function normalizeSectionsForSave(sections: CategorySection[]): CategorySection[] {
  return sections.map((section) => {
    const base = { ...section, title: dropEmpty(section.title) };
    switch (base.type) {
      case "files":
        return { ...base, items: base.items.map((item) => ({ ...item, label: dropEmpty(item.label) })) };
      case "cards":
        return {
          ...base,
          items: base.items.map((item) => ({
            ...item,
            // SelectField пишет "" при сбросе выбора — для схемы это «нет иконки»
            icon: dropEmpty(item.icon) as CardIconKey | undefined,
            text: dropEmpty(item.text),
          })),
        };
      case "video":
        return { ...base, url: base.url.trim() };
      default:
        return base;
    }
  });
}

/** Есть ли среди секций спец-блок данного типа (например, чтобы не дублировать плитки подкатегорий). */
export function hasSpecialSection(sections: unknown, block: SpecialBlockKey): boolean {
  return parseSections(sections).some((section) => section.type === "special" && section.block === block);
}

/** Явные ссылки на файлы из секций (items[].fileId) — для проверки существования при записи. */
export function extractSectionFileIds(sections: CategorySection[]): string[] {
  return sections.flatMap((section) => (section.type === "files" ? section.items.map((item) => item.fileId) : []));
}

/**
 * Все упоминания файлов из public/uploads в произвольном JSON (значения ключей fileId
 * и `/uploads/…`-ссылки внутри строк, включая HTML rich-редактора).
 *
 * Работает по сырому значению, без схемы — чтобы будущие типы секций автоматически
 * учитывались чисткой сирот. Логика продублирована в scripts/cleanup-orphan-files.mjs
 * (plain JS без импорта TS) — менять синхронно.
 */
export function collectUploadReferences(value: unknown, into = new Set<string>()): Set<string> {
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
      if (key === "fileId" && typeof nested === "string") into.add(nested);
      else collectUploadReferences(nested, into);
    }
  }
  return into;
}
