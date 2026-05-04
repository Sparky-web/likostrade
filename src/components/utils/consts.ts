export const Size = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "lg",
} as const;
export type Size = (typeof Size)[keyof typeof Size];

export const stackAlignItemsClasses = {
  start: "items-start",
  end: "items-end",
  center: "items-center",
  stretch: "items-stretch",
  baseline: "items-baseline",
} as const;

export type StackAlignItems = keyof typeof stackAlignItemsClasses;

export const stackJustifyContentClasses = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
  stretch: "justify-stretch",
} as const;

export type StackJustifyContent = keyof typeof stackJustifyContentClasses;

/** Figma spacing (mode shadcn) → Tailwind arbitrary gap; values in px */
export const stackGapClasses = {
  "3xs": "gap-0.5",
  "2xs": "gap-1",
  xs: "gap-2",
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-5",
  xl: "gap-6",
  "2xl": "gap-8",
  "3xl": "gap-8",
  "4xl": "gap-10",
  /** Расстояние между крупными секциями страницы; совпадает с `4xl` */
  section: "gap-10",
  "5xl": "gap-12",
} as const;

export type StackGap = keyof typeof stackGapClasses;

/** Соответствие семантического цвета текста классам Tailwind. */
export const textColorClasses = {
  main: "text-foreground",
  supplementary: "text-muted-foreground",
} as const;

export type TextColor = keyof typeof textColorClasses;

/**
 * Ограничение числа строк (line-clamp). Каждое значение — полный класс для JIT Tailwind
 * (без динамической сборки `line-clamp-${n}`).
 */
export const maxLinesClasses = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
  7: "line-clamp-[7]",
  8: "line-clamp-[8]",
  9: "line-clamp-[9]",
  10: "line-clamp-[10]",
} as const;

export type MaxLines = keyof typeof maxLinesClasses;

/**
 * Перенос длинных «слов» и автоматическая расстановка переносов. Статическая строка для Tailwind.
 * Соответствует `overflow-wrap`/`word-break` через `break-words` и `hyphens: auto` через `hyphens-auto`.
 */
export const breakWordsTypographyClasses = "break-words hyphens-auto" as const;
