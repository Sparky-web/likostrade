import { typo, typoRaw } from "lib";

/**
 * Централизованные константы сайта: SEO, суть бизнеса, контакты и карта.
 * Русский текст UI пропущен через `typo` (неразрывные пробелы); метаданные — plain text.
 * Телефон — только цифры; отображение и `tel:` — в компонентах.
 * `mailto:` собирай на месте из `EMAIL`.
 */
export const websiteConstants = {
  /* eslint-disable require-typo/require-typo-for-cyrillic -- метаданные: plain text для SEO */
  METADATA_TITLE: "Производство металлоконструкций в Екатеринбурге | ООО Ликос",
  METADATA_DESCRIPTION:
    "ООО «Ликос» - металлообработка, плазменная резка и производство электрощитового оборудования. Работаем с 2007 года, более 200 клиентов на Урале.",
  PROJECTS_METADATA_TITLE: "Наши работы",
  PROJECTS_METADATA_DESCRIPTION:
    "Каталог выполненных проектов ООО «Ликос»: металлоконструкции, электрощитовое оборудование и металлообработка в Екатеринбурге.",
  NOT_FOUND_METADATA_TITLE: "Страница не найдена",
  NOT_FOUND_METADATA_DESCRIPTION: "Запрашиваемая страница не существует или была удалена.",
  SIGN_IN_METADATA_TITLE: "Вход",
  ADMIN_METADATA_TITLE: "Админ-панель",
  /* eslint-enable require-typo/require-typo-for-cyrillic */
  COMPANY_NAME: typo(`ООО «Ликос»`),
  INN: "6658263024",
  ADDRESS: typo("г. Екатеринбург, ул. Мартовская, дом 8"),
  WORK_HOURS: typoRaw(`понедельник - пятница с 09:00 до 18:00{br}суббота - с 09:00 до 16:00`, { br: <br /> }),
  PHONE_DIGITS: "79923313405",
  EMAIL: "likostrade@mail.ru",
  /** Ссылка на карту (поиск организации в Яндекс.Картах) */
  SITE_MAP_URL:
    "https://yandex.ru/maps/?text=%D0%95%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B1%D1%83%D1%80%D0%B3%2C%20%D1%83%D0%BB.%20%D0%9C%D0%B0%D1%80%D1%82%D0%BE%D0%B2%D1%81%D0%BA%D0%B0%D1%8F%2C%208",
  /** Встраиваемая Яндекс.Карта (виджет) */
  MAP_EMBED_URL:
    "https://yandex.ru/map-widget/v1/?ll=60.520718%2C56.774995&mode=search&ol=geo&ouri=ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgg1NjA2NzI2NxKbAdCg0L7RgdGB0LjRjywg0KHQstC10YDQtNC70L7QstGB0LrQsNGPINC-0LHQu9Cw0YHRgtGMLCDQldC60LDRgtC10YDQuNC90LHRg9GA0LMsINC20LjQu9C-0Lkg0YDQsNC50L7QvSDQldC70LjQt9Cw0LLQtdGCLCDQnNCw0YDRgtC-0LLRgdC60LDRjyDRg9C70LjRhtCwLCA4IgoN03ZyQhUABmNC&z=12.33",
  WHATSAPP_URL: "https://wa.me/79923313405",
  TELEGRAM_URL: "https://t.me/+79923313405",
  /** Персональная ссылка на профиль в MAX (Настройки → QR-код → Поделиться). Прямой ссылки по номеру, как wa.me, нет. */
  MAX_URL: "https://max.ru/u/f9LHodD0cOJeiucOqlFj2f5x_nxeCXRdL9A07VgBhLVUOmguoBc9v_K7WuA",
} as const;
