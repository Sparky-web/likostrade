// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck — typograf: типы не резолвятся через package.json exports при moduleResolution Bundler
/* eslint-disable */
import i18next from "i18next";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";
import translation from "zod-i18n-map/locales/ru/zod.json";

i18next.init({
  lng: "ru",
  resources: {
    ru: { zod: translation },
  },
});

z.setErrorMap(zodI18nMap);

export { z as zodRussian };
