import { createTableRouter } from "lib/server";

import { createCallerFactory, createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

import { baseTableRouter } from "./routers/baseTableRouter";
import { fileUploaderRouter } from "./routers/fileUploader";
import { projectsRouter } from "./routers/projects";
import { siteSettingsRouter } from "./routers/siteSettings";
import { videosRouter } from "./routers/videos";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  categories: createTableRouter({
    dbTable: "Category",
    procedures: {
      get: publicProcedure,
      getById: publicProcedure,
      create: protectedProcedure,
      update: protectedProcedure,
      delete: protectedProcedure,
    },
    findManyArgs: {
      include: {
        subcategories: true,
        parentCategories: true,
        videos: true,
      },
    },
    findUniqueArgs: {
      include: {
        subcategories: true,
        parentCategories: true,
        videos: true,
      },
    },
    // Подкатегории — самосвязная M2M; на вход create/update принимаем только массив id.
    // parentCategories редактируем не здесь — задаются с противоположной стороны связи.
    relationFields: ["subcategories"] as const,
  }),
  files: createTableRouter({
    dbTable: "File",
    procedures: {
      get: publicProcedure,
      getById: publicProcedure,
      create: protectedProcedure,
      update: protectedProcedure,
      delete: protectedProcedure,
    },
    findManyArgs: {
      include: {
        categories: true,
        projectMainImages: true,
        projectAdditionalImages: true,
      },
    },
    findUniqueArgs: {
      include: {
        categories: true,
        projectMainImages: true,
        projectAdditionalImages: true,
      },
    },
  }),
  projects: projectsRouter,
  videos: videosRouter,
  fileUploaderRouter,
  siteSettings: siteSettingsRouter,
  baseTableRouter: baseTableRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
