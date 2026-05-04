const RU_MSISDN = /^7\d{10}$/;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**11 цифр, первая 7 — после нормализации 8→7 и дописывания 7 к 10-значным 9… */
function normalizeRu11(d: string): string | null {
  let x = d;
  if (x.length === 11 && x.startsWith("8")) {
    x = `7${x.slice(1)}`;
  }
  if (x.length === 10 && x.startsWith("9")) {
    x = `7${x}`;
  }
  return RU_MSISDN.test(x) ? x : null;
}

function formatRu11(d: string): string {
  const a = d.slice(1, 4);
  const b = d.slice(4, 7);
  const c = d.slice(7, 9);
  const e = d.slice(9, 11);
  return `+7 (${a}) ${b}-${c}-${e}`;
}

/**
 * Форматирует номер в стиле `79126871952` → `+7 (912) 687-19-52`.
 * Принимает также `8…`, `+7…`, пробелы и скобки.
 * Если после нормализации это не RU MSISDN — возвращает исходную строку и пишет `console.warn`.
 */
export function formatPhoneNumber(input: string): string {
  const normalized = normalizeRu11(digitsOnly(input));
  if (!normalized) {
    console.warn(
      "[formatPhoneNumber] не похоже на российский номер (ожидается 11 цифр вида 7XXXXXXXXXX после нормализации):",
      input,
    );
    return input;
  }
  return formatRu11(normalized);
}
