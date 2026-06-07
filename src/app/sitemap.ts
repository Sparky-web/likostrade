import type { MetadataRoute } from "next";

import { env } from "~/env";
import { db } from "~/server/db";

/** Публичный origin сайта для абсолютных URL в sitemap. */
function getBaseUrl(): string {
  if (env.AUTH_URL) {
    return env.AUTH_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const [categories, projects] = await Promise.all([
    db.category.findMany({
      where: { isHidden: false },
      select: { id: true },
    }),
    db.project.findMany({
      where: { isHidden: false },
      select: { id: true, dateCompleted: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: new Date(project.dateCompleted),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...projectPages];
}
