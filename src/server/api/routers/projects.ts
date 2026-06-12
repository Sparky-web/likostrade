import { isoDateStringSchema, zodRussian } from "lib";

import { getCategoriesForPreview } from "../lib/getCategoriesForPreview";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const PREVIEW_LIMIT = 3;

const projectListInclude = {
  categories: true,
  mainImage: true,
  additionalImages: true,
} as const;

/** Поля формы проекта; relation-поля приходят массивами id. */
const projectFieldsInput = zodRussian.object({
  title: zodRussian.string().min(1),
  shortDescription: zodRussian.string().nullable(),
  dateCompleted: isoDateStringSchema,
  price: zodRussian.string().nullable(),
  timeToComplete: zodRussian.string().nullable(),
  task: zodRussian.string().nullable(),
  workProgress: zodRussian.string().nullable(),
  result: zodRussian.string().nullable(),
  mainImageId: zodRussian.string().nullable(),
  additionalImages: zodRussian.array(zodRussian.string()),
  categories: zodRussian.array(zodRussian.string()),
  isHidden: zodRussian.boolean(),
});

// id (слаг из translit) задаётся только при создании; в update пришедший с клиента id отбрасывается схемой
const createProjectInput = projectFieldsInput.extend({ id: zodRussian.string().min(1) });

const getProjectsInput = zodRussian
  .object({
    // Белый список фильтров, доступных клиенту
    where: zodRussian.object({ isHidden: zodRussian.boolean() }).optional(),
  })
  .optional();

export const projectsRouter = createTRPCRouter({
  get: publicProcedure.input(getProjectsInput).query(({ ctx, input }) =>
    ctx.db.project.findMany({
      where: input?.where,
      orderBy: { dateCompleted: "desc" },
      include: projectListInclude,
    }),
  ),

  getById: publicProcedure
    .input(zodRussian.object({ id: zodRussian.string() }))
    .query(({ ctx, input }) =>
      ctx.db.project.findUnique({
        where: { id: input.id },
        include: projectListInclude,
      }),
    ),

  create: protectedProcedure.input(createProjectInput).mutation(({ ctx, input }) => {
    const { categories, additionalImages, ...scalars } = input;
    return ctx.db.project.create({
      data: {
        ...scalars,
        categories: { connect: categories.map((id) => ({ id })) },
        additionalImages: { connect: additionalImages.map((id) => ({ id })) },
      },
    });
  }),

  update: protectedProcedure
    .input(zodRussian.object({ id: zodRussian.string(), data: projectFieldsInput }))
    .mutation(async ({ ctx, input }) => {
      const { categories, additionalImages, ...scalars } = input.data;
      await ctx.db.project.update({
        where: { id: input.id },
        data: {
          ...scalars,
          // set — полная замена состава связи по списку id из формы
          categories: { set: categories.map((id) => ({ id })) },
          additionalImages: { set: additionalImages.map((id) => ({ id })) },
        },
      });
      return true;
    }),

  delete: protectedProcedure
    .input(zodRussian.object({ id: zodRussian.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.project.delete({ where: { id: input.id } });
      return true;
    }),

  getPreviewByCategory: publicProcedure
    .input(
      zodRussian.object({
        categoryId: zodRussian.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const categoryIds = await getCategoriesForPreview(ctx.db, input.categoryId);
      if (categoryIds.length === 0) return [];

      return ctx.db.project.findMany({
        where: {
          isHidden: false,
          categories: { some: { id: { in: categoryIds }, isHidden: false } },
        },
        orderBy: { dateCompleted: "desc" },
        include: projectListInclude,
        take: PREVIEW_LIMIT,
      });
    }),
});
