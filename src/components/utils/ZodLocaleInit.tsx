"use client";

import { zodRussian } from "lib/src/zodRussian";
import { useEffect } from "react";

/**
 * Глобально включает русские сообщения zod на клиенте: модуль zodRussian при импорте вызывает
 * z.setErrorMap(ru-локаль). Без этого на страницах, где zodRussian не попал в клиентский бандл,
 * zod показывал ошибки по-английски. Рендерится один раз в корневом layout.
 */
export function ZodLocaleInit() {
  useEffect(() => {
    // Ссылка на импорт, чтобы бандлер не вырезал модуль (его side-effect и ставит локаль).
    void zodRussian;
  }, []);
  return null;
}
