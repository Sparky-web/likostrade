import { FlatCompat } from "@eslint/eslintrc";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

import blazeBuildEslintPlugin from "./eslint/rules/lib-barrel-imports.mjs";
import preferBlazeLink from "./eslint/rules/prefer-blaze-link.mjs";
import requireTypoForCyrillic from "./eslint/rules/require-typo-for-cyrillic.mjs";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    // Генерируется Next.js; triple-slash на routes.d.ts — ожидаемая схема типов маршрутов
    ignores: [".next", "generated/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "react-hooks": reactHooks,
      "blaze-build": blazeBuildEslintPlugin,
      "blaze-link": preferBlazeLink,
      "require-typo": requireTypoForCyrillic,
      "simple-import-sort": simpleImportSort,
    },
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/exhaustive-deps": "error",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports", fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
      "blaze-build/lib-barrel-imports": "error",
      "blaze-link/prefer-blaze-link": "error",
      "require-typo/require-typo-for-cyrillic": "error",
      "require-typo/typo-import-from-lib": "error",
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": "error",
      // Согласовано с printWidth в prettier.config.js; строки/шаблоны не режем — их переносит Prettier при необходимости
      "max-len": [
        "warn",
        {
          code: 128,
          tabWidth: 2,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
      "react/no-children-prop": "off"
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/src/components/**"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^~/components/(blaze|ui|hooks|utils)(/|$)",
              message: 'Import from "~/components" (barrel) instead of subpaths like ~/components/blaze or ~/components/ui.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/server/**/*.{ts,tsx}"],
    rules: {
      "require-typo/require-typo-for-cyrillic": "off",
      "require-typo/typo-import-from-lib": "off",
    },
  },
  // RichEditor (TipTap / ProseMirror): обёрточная типизация даёт тысячи ложных no-unsafe-*; @ts-nocheck в нескольких extension-файлах сохранён намеренно
  {
    files: ["src/components/blaze/RichEditor/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/non-nullable-type-assertion-style": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@next/next/no-img-element": "off",
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
