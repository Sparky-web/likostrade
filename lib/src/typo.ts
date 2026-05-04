// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — typograf: типы не резолвятся через package.json exports при moduleResolution Bundler
/* eslint-disable */
import { cloneElement, createElement, Fragment, isValidElement, type ReactNode } from "react";
import Typograf from "typograf";

/**
 * Один экземпляр Typograf: включены только правила неразрывных пробелов (common/nbsp, ru/nbsp).
 * Кавычки, тире и прочая типографика не применяются.
 */
function createNbspOnlyTypograf() {
  const tp = new Typograf({ locale: ["ru", "en-US"] });
  tp.disableRule("*");
  tp.enableRule(["common/nbsp/*", "ru/nbsp/*"]);
  tp.disableRule("common/nbsp/replaceNbsp");
  return tp;
}

const typografNbsp = createNbspOnlyTypograf();

const PLACEHOLDER = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

/** Типографика только NBSP для готовой строки. */
export function typo(text: string): string {
  return typografNbsp.execute(text);
}

/**
 * Как `typo`, но в шаблоне допускаются плейсхолдеры `{имя}`; на их место подставляются узлы React.
 * Текстовые сегменты прогоняются через `typo`. Неизвестный плейсхолдер остаётся в тексте как `{имя}`.
 *
 * @example
 * typoRaw("Привет {br}мир", { br: <br /> })
 */
export function typoRaw(template: string, slots: Record<string, ReactNode>): ReactNode {
  if (!template) {
    return null;
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(PLACEHOLDER.source, "g");

  while ((m = re.exec(template)) !== null) {
    const [full, name] = m;
    if (m.index > lastIndex) {
      const raw = template.slice(lastIndex, m.index);
      if (raw.length > 0) {
        parts.push(typo(raw));
      }
    }
    if (name != null && Object.prototype.hasOwnProperty.call(slots, name) && slots[name] !== undefined) {
      parts.push(slots[name] as ReactNode);
    } else {
      parts.push(full);
    }
    lastIndex = m.index + full.length;
  }
  if (lastIndex < template.length) {
    const tail = template.slice(lastIndex);
    if (tail.length > 0) {
      parts.push(typo(tail));
    }
  }

  if (parts.length === 0) {
    return null;
  }
  if (parts.length === 1) {
    return parts[0] as ReactNode;
  }
  return createElement(
    Fragment,
    null,
    ...parts.map((child, i) => (isValidElement(child) ? cloneElement(child, { key: `typoRaw-${i}` }) : child)),
  );
}
