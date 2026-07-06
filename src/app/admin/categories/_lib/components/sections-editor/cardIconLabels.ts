import { typo } from "lib";

import type { CardIconKey } from "~/sections/schema";

/** Русские подписи иконок секции «карточки» для селекта админки. */
export const CARD_ICON_LABELS = {
  award: typo("Награда"),
  badgeCheck: typo("Знак качества"),
  clock: typo("Часы"),
  cog: typo("Шестерня"),
  factory: typo("Завод"),
  flame: typo("Пламя"),
  gauge: typo("Манометр"),
  hammer: typo("Молоток"),
  handshake: typo("Рукопожатие"),
  hardHat: typo("Каска"),
  layers: typo("Слои"),
  mapPin: typo("Геометка"),
  packageCheck: typo("Комплектация"),
  ruler: typo("Линейка"),
  settings: typo("Настройки"),
  shieldCheck: typo("Щит"),
  sparkles: typo("Блеск"),
  thermometer: typo("Термометр"),
  timer: typo("Таймер"),
  truck: typo("Грузовик"),
  users: typo("Люди"),
  wrench: typo("Гаечный ключ"),
  zap: typo("Молния"),
} as const satisfies Record<CardIconKey, string>;
