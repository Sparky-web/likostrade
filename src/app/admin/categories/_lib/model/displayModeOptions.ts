import { typo } from "lib";

import type { SelectFieldOption } from "~/components";

/** Опции селекта режима шапки публичной страницы. */
export const HEADER_MODE_OPTIONS: SelectFieldOption[] = [
  { value: "HERO", label: typo("Hero-баннер"), description: typo("Крупный баннер с фото, как раньше") },
  { value: "COMPACT", label: typo("Компактная"), description: typo("Хлебные крошки + заголовок + описание") },
];

/** Опции селекта режима вывода подкатегорий. */
export const CHILDREN_MODE_OPTIONS: SelectFieldOption[] = [
  { value: "TILES", label: typo("Плитки"), description: typo("Сетка плиток с фото, как раньше") },
  { value: "SIDEBAR", label: typo("Сайдбар-каталог"), description: typo("Дерево слева, контент справа (как evraz.pro)") },
  {
    value: "CARDS",
    label: typo("Карточки товаров"),
    description: typo("Карточки в потоке контента; в сайдбар не попадают"),
  },
];
