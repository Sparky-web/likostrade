import { typo } from "lib";

/** Пункты основной навигации шапки */
export type SiteNavItem = {
  href: string;
  label: string;
};

export const SITE_ADDRESS = typo(`Свердловская область, г. Екатеринбург, ул. Мартовская д. 8`);

/** Ссылка на карту (замените на точку организации в Яндекс/Google Maps) */
export const SITE_MAP_URL =
  "https://yandex.ru/maps/?text=%D0%95%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B1%D1%83%D1%80%D0%B3%2C%20%D1%83%D0%BB.%20%D0%9C%D0%B0%D1%80%D1%82%D0%BE%D0%B2%D1%81%D0%BA%D0%B0%D1%8F%2C%208";

export const SITE_PHONE = "79126871952";
export const SITE_EMAIL = "inbox@lykos.ru";

/** Заголовок выпадающего раздела с категориями услуг */
export const SITE_SERVICES_NAV_LABEL = typo(`Наши услуги`);

export const SITE_NAV_ITEMS: SiteNavItem[] = [
  { href: "/about", label: typo(`О компании`) },
  { href: "/projects", label: typo(`Наши работы`) },
  { href: "/equipment", label: typo(`Оборудование`) },
  { href: "/reviews", label: typo(`Отзывы`) },
];
