import type { MetadataRoute } from "next";

import { getSiteBaseUrl } from "./_lib/lib/siteUrl";

/** robots.txt: разрешаем публичные страницы, закрываем служебные, объявляем sitemap. */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/auth"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
