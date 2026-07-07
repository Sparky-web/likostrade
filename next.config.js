/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Линт прогоняется отдельно (`npx eslint` / `pnpm check`). Флаг SKIP_LINT=1 отключает
  // встроенный в `next build` линт (обходит флейки-кэш eslint локально). По умолчанию линт работает.
  eslint: { ignoreDuringBuilds: process.env.SKIP_LINT === "1" },
};

export default config;
