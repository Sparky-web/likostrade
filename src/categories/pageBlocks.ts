import { typo, zodRussian } from "lib";

/** Системные блоки нижней части страницы категории, доступные для сортировки в админке. */
export const CATEGORY_PAGE_BLOCK_KEYS = ["completedProjects", "aboutUs", "contacts", "requestForm"] as const;

export type CategoryPageBlockKey = (typeof CATEGORY_PAGE_BLOCK_KEYS)[number];

export const CATEGORY_PAGE_BLOCKS = {
  completedProjects: {
    label: typo("Завершённые проекты"),
    visibilityField: "showCompletedProjects",
  },
  aboutUs: {
    label: typo("О нас"),
    visibilityField: "showClientsPartners",
  },
  contacts: {
    label: typo("Контакты"),
    visibilityField: "showContacts",
  },
  requestForm: {
    label: typo("Форма заявки"),
    visibilityField: "showRequestForm",
  },
} as const satisfies Record<
  CategoryPageBlockKey,
  {
    label: string;
    visibilityField: "showCompletedProjects" | "showClientsPartners" | "showContacts" | "showRequestForm";
  }
>;

/** Текущий порядок публичной страницы — миграция сохраняет его для существующих категорий. */
export const DEFAULT_CATEGORY_PAGE_BLOCK_ORDER: CategoryPageBlockKey[] = [
  "aboutUs",
  "completedProjects",
  "requestForm",
  "contacts",
];

const categoryPageBlockKeySchema = zodRussian.enum(CATEGORY_PAGE_BLOCK_KEYS);

/** Порядок должен содержать каждый системный блок ровно один раз. */
export const categoryPageBlockOrderSchema = zodRussian
  .array(categoryPageBlockKeySchema)
  .length(CATEGORY_PAGE_BLOCK_KEYS.length)
  .refine((order) => new Set(order).size === CATEGORY_PAGE_BLOCK_KEYS.length, {
    message: typo("Порядок блоков страницы содержит повторения"),
  });

/** Толерантное чтение старых/повреждённых данных: валидные ключи сохраняются, пропущенные дополняются. */
export function normalizeCategoryPageBlockOrder(value: unknown): CategoryPageBlockKey[] {
  const normalized: CategoryPageBlockKey[] = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      const parsed = categoryPageBlockKeySchema.safeParse(item);
      if (parsed.success && !normalized.includes(parsed.data)) normalized.push(parsed.data);
    }
  }

  for (const key of DEFAULT_CATEGORY_PAGE_BLOCK_ORDER) {
    if (!normalized.includes(key)) normalized.push(key);
  }

  return normalized;
}
