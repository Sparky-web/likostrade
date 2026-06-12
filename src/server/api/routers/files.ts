import { zodRussian } from "lib";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const fileInclude = {
  categories: true,
  projectMainImages: true,
  projectAdditionalImages: true,
  leadAttachments: true,
} as const;

// Запись File создаётся загрузкой через fileUploader.upload, поэтому create-процедуры нет;
// редактируется только alt
const updateFileInput = zodRussian.object({
  alt: zodRussian.string().nullable(),
});

export const filesRouter = createTRPCRouter({
  get: publicProcedure.query(({ ctx }) =>
    ctx.db.file.findMany({
      orderBy: { id: "desc" },
      include: fileInclude,
    }),
  ),

  getById: publicProcedure
    .input(zodRussian.object({ id: zodRussian.string() }))
    .query(({ ctx, input }) =>
      ctx.db.file.findUnique({
        where: { id: input.id },
        include: fileInclude,
      }),
    ),

  update: protectedProcedure
    .input(zodRussian.object({ id: zodRussian.string(), data: updateFileInput }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.file.update({
        where: { id: input.id },
        data: input.data,
      });
      return true;
    }),

  delete: protectedProcedure
    .input(zodRussian.object({ id: zodRussian.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.file.delete({ where: { id: input.id } });
      return true;
    }),
});
