/** Строчные русские буквы → латиница (читаемая транслитерация для slug’ов и id). */
const CYRILLIC_LOWER: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

const CYRILLIC_UPPER: Record<string, string> = Object.fromEntries(
  Object.entries(CYRILLIC_LOWER).map(([ru, lat]) => {
    const up = ru.toUpperCase();
    const latUp = lat.length === 0 ? "" : lat.charAt(0).toUpperCase() + lat.slice(1);
    return [up, latUp];
  }),
);

const isCyrillic = (ch: string) => CYRILLIC_LOWER[ch] !== undefined || CYRILLIC_UPPER[ch] !== undefined;

const isAsciiLatin = (ch: string) => /[a-zA-Z]/.test(ch);

/**
 * Транслитерация с русского на латиницу. Остаются только пробелы, кириллица и латиница (a–z, A–Z);
 * всё остальное (цифры, знаки и т.д.) отбрасывается. Кириллица → латиница, пробелы → `-`,
 * подряд идущие дефисы схлопываются, крайние дефисы убираются.
 */
export function translit(input: string): string {
  let out = "";
  for (const ch of input) {
    if (/\s/.test(ch)) {
      out += "-";
      continue;
    }
    if (!isCyrillic(ch) && !isAsciiLatin(ch)) {
      continue;
    }
    if (CYRILLIC_LOWER[ch] !== undefined) {
      out += CYRILLIC_LOWER[ch];
      continue;
    }
    if (CYRILLIC_UPPER[ch] !== undefined) {
      out += CYRILLIC_UPPER[ch];
      continue;
    }
    out += ch;
  }

  return out
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
