import { typo, typoRaw } from "lib";

/**
 * Централизованные константы сайта: SEO, суть бизнеса, контакты и карта.
 * Русский текст сразу пропущен через `typo` (неразрывные пробелы).
 * Телефон — только цифры; отображение и `tel:` — в компонентах.
 * `mailto:` собирай на месте из `EMAIL`.
 */
export const websiteConstants = {
  METADATA_TITLE: typo("Поставщик металлоконструкций — производство и монтаж"),
  METADATA_DESCRIPTION: typo(
    "Завод: изготовление, доставка, монтаж и демонтаж металлоконструкций. Екатеринбург, НАКС, ОТК, ж/д и авто отгрузка.",
  ),
  ADDRESS: typo("г. Екатеринбург, ул. Мартовская, дом 8"),
  WORK_HOURS: typoRaw(`понедельник - пятница с 09:00 до 18:00{br}суббота - с 09:00 до 16:00`, { br: <br /> }),
  PHONE_DIGITS: "79126871952",
  EMAIL: "babinovvlad@gmail.com",
  /** Встраиваемая Яндекс.Карта (виджет) */
  MAP_EMBED_URL:
    "https://yandex.ru/map-widget/v1/?ll=60.520718%2C56.774995&mode=search&ol=geo&ouri=ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgg1NjA2NzI2NxKbAdCg0L7RgdGB0LjRjywg0KHQstC10YDQtNC70L7QstGB0LrQsNGPINC-0LHQu9Cw0YHRgtGMLCDQldC60LDRgtC10YDQuNC90LHRg9GA0LMsINC20LjQu9C-0Lkg0YDQsNC50L7QvSDQldC70LjQt9Cw0LLQtdGCLCDQnNCw0YDRgtC-0LLRgdC60LDRjyDRg9C70LjRhtCwLCA4IgoN03ZyQhUABmNC&z=12.33",
  WHATSAPP_URL: "https://wa.me/79126871952",
  TELEGRAM_URL: "https://t.me/+79126871952",
} as const;
