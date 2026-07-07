import { env } from "~/env";

/** Публичный origin сайта для абсолютных URL (canonical, OG, sitemap, robots, JSON-LD). */
export function getSiteBaseUrl(): string {
  if (env.AUTH_URL) {
    return env.AUTH_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
