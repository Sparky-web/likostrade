import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "generated/prisma";
import { zodRussian } from "lib";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const SITE_SETTINGS_ID = "default";

const siteSettingsUpdateInput = zodRussian.object({
  homepagePinnedProjectIds: zodRussian.array(zodRussian.string()),
});

const projectPublicInclude = {
  categories: true,
  mainImage: true,
  additionalImages: true,
} as const;

async function getOrCreateSiteSettings(db: PrismaClient) {
  return db.siteSettings.upsert({
    where: { id: SITE_SETTINGS_ID },
    create: { id: SITE_SETTINGS_ID },
    update: {},
  });
}

async function getHomepagePinnedProjects(db: PrismaClient, projectIds: string[]) {
  if (projectIds.length === 0) {
    return [];
  }

  const projects = await db.project.findMany({
    where: {
      id: { in: projectIds },
      isHidden: false,
    },
    include: projectPublicInclude,
  });

  const projectsById = new Map(projects.map((project) => [project.id, project]));

  return projectIds
    .map((projectId) => projectsById.get(projectId))
    .filter((project): project is (typeof projects)[number] => project != null);
}

export const siteSettingsRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return getOrCreateSiteSettings(ctx.db);
  }),

  update: protectedProcedure.input(siteSettingsUpdateInput).mutation(async ({ ctx, input }) => {
    const uniqueProjectIds = [...new Set(input.homepagePinnedProjectIds)];

    if (uniqueProjectIds.length > 0) {
      const existingProjects = await ctx.db.project.findMany({
        where: { id: { in: uniqueProjectIds } },
        select: { id: true },
      });

      if (existingProjects.length !== uniqueProjectIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Указаны несуществующие работы",
        });
      }
    }

    return ctx.db.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      create: {
        id: SITE_SETTINGS_ID,
        homepagePinnedProjectIds: input.homepagePinnedProjectIds,
      },
      update: {
        homepagePinnedProjectIds: input.homepagePinnedProjectIds,
      },
    });
  }),

  getPublic: publicProcedure.query(async ({ ctx }) => {
    const settings = await getOrCreateSiteSettings(ctx.db);
    const homepagePinnedProjects = await getHomepagePinnedProjects(ctx.db, settings.homepagePinnedProjectIds);

    return { homepagePinnedProjects };
  }),
});
