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
  PROJECTS_METADATA_TITLE: "Выполненные проекты — металлоконструкции и электрощиты в Екатеринбурге",
  PROJECTS_METADATA_DESCRIPTION:
    "Каталог выполненных проектов ООО «Ликос»: металлоконструкции, электрощитовое оборудование и металлообработка в Екатеринбурге.",
  NOT_FOUND_METADATA_TITLE: "Страница не найдена",
  NOT_FOUND_METADATA_DESCRIPTION: "Запрашиваемая страница не существует или была удалена.",
  SIGN_IN_METADATA_TITLE: "Вход",
  ADMIN_METADATA_TITLE: "Админ-панель",
  /** Бренд для шаблона title дочерних страниц («… | ООО «Ликос»»). */
  BRAND_TITLE_SUFFIX: "%s | ООО «Ликос»",
  /** Компоненты адреса для JSON-LD (PostalAddress). */
  ADDRESS_LOCALITY: "Екатеринбург",
  ADDRESS_STREET: "ул. Животноводов, 26",
  /* eslint-enable require-typo/require-typo-for-cyrillic */
  COMPANY_NAME: typo(`ООО «Ликос»`),
  INN: "6658263024",
  ADDRESS: typo("г. Екатеринбург, ул. Животноводов, дом 26"),
  WORK_HOURS: typoRaw(`понедельник - пятница с 09:00 до 18:00{br}суббота - с 09:00 до 16:00`, { br: <br /> }),
  PHONE_DIGITS: "79923313405",
  EMAIL: "likostrade@mail.ru",
  /** Ссылка на карту (поиск организации в Яндекс.Картах) */
  SITE_MAP_URL:
    "https://yandex.ru/maps/?ll=60.559974%2C56.714323&mode=search&text=%D0%95%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B1%D1%83%D1%80%D0%B3%2C%20%D1%83%D0%BB.%20%D0%96%D0%B8%D0%B2%D0%BE%D1%82%D0%BD%D0%BE%D0%B2%D0%BE%D0%B4%D0%BE%D0%B2%2C%2026&z=16",
  /** Встраиваемая Яндекс.Карта (виджет) */
  MAP_EMBED_URL:
    "https://yandex.ru/map-widget/v1/?ll=60.559974%2C56.714323&mode=search&text=%D0%95%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B1%D1%83%D1%80%D0%B3%2C%20%D1%83%D0%BB.%20%D0%96%D0%B8%D0%B2%D0%BE%D1%82%D0%BD%D0%BE%D0%B2%D0%BE%D0%B4%D0%BE%D0%B2%2C%2026&z=16",
  WHATSAPP_URL: "https://wa.me/79923313405",
  TELEGRAM_URL: "https://t.me/+79923313405",
  /** Персональная ссылка на профиль в MAX (Настройки → QR-код → Поделиться). Прямой ссылки по номеру, как wa.me, нет. */
  MAX_URL: "https://max.ru/u/f9LHodD0cOJeiucOqlFj2f5x_nxeCXRdL9A07VgBhLVUOmguoBc9v_K7WuA",
} as const;
