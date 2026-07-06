import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

import { categoriesRouter } from "./routers/categories";
import { cuttingRouter } from "./routers/cutting";
import { filesRouter } from "./routers/files";
import { fileUploaderRouter } from "./routers/fileUploader";
import { leadsRouter } from "./routers/leads";
import { projectsRouter } from "./routers/projects";
import { siteSettingsRouter } from "./routers/siteSettings";
import { videosRouter } from "./routers/videos";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  cutting: cuttingRouter,
  files: filesRouter,
  projects: projectsRouter,
  videos: videosRouter,
  leads: leadsRouter,
  fileUploaderRouter,
  siteSettings: siteSettingsRouter,
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
