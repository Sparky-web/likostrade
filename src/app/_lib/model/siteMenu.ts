import { typo } from "lib";

import { websiteConstants } from "~/consts";

/** Пункты основной навигации шапки */
export type SiteNavItem = {
  href: string;
  label: string;
  /** Подсветка активного пункта в меню; по умолчанию включена. */
  highlightWhenActive?: boolean;
};

export const SITE_ADDRESS = websiteConstants.ADDRESS;
export const SITE_MAP_URL = websiteConstants.SITE_MAP_URL;
export const SITE_PHONE = websiteConstants.PHONE_DIGITS;
export const SITE_EMAIL = websiteConstants.EMAIL;

/** Заголовок выпадающего раздела с категориями услуг */
export const SITE_SERVICES_NAV_LABEL = typo(`Наши услуги`);

export const SITE_NAV_ITEMS: SiteNavItem[] = [
  { href: "/", label: typo(`О компании`), highlightWhenActive: false },
  { href: "/projects", label: typo(`Наши работы`) },
];
