import { zodRussian } from "lib";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const categoryInclude = {
  subcategories: true,
  parentCategories: true,
  videos: true,
} as const;

/**
 * Поля формы категории; subcategories — массив id (самосвязная M2M).
 * parentCategories здесь не редактируются — задаются с противоположной стороны связи.
 */
const categoryFieldsInput = zodRussian.object({
  title: zodRussian.string().min(1),
  landingTitle: zodRussian.string().nullable(),
  shortDescription: zodRussian.string().nullable(),
  htmlDescription: zodRussian.string().nullable(),
  imageId: zodRussian.string().nullable(),
  isHidden: zodRussian.boolean(),
  subcategories: zodRussian.array(zodRussian.string()),
});

// id (слаг из translit) задаётся только при создании; в update пришедший с клиента id отбрасывается схемой
const createCategoryInput = categoryFieldsInput.extend({ id: zodRussian.string().min(1) });

// Белый список фильтров с клиента: скрытость и «только корневые» (без родительских категорий)
const getCategoriesInput = zodRussian
  .object({
    where: zodRussian
      .object({
        isHidden: zodRussian.boolean().optional(),
        parentCategories: zodRussian.object({ none: zodRussian.object({}).strict() }).optional(),
      })
      .optional(),
  })
  .optional();

export const categoriesRouter = createTRPCRouter({
  get: publicProcedure.input(getCategoriesInput).query(({ ctx, input }) =>
    ctx.db.category.findMany({
      where: input?.where,
      orderBy: { id: "desc" },
      include: categoryInclude,
    }),
  ),

  getById: publicProcedure
    .input(zodRussian.object({ id: zodRussian.string() }))
    .query(({ ctx, input }) =>
      ctx.db.category.findUnique({
        where: { id: input.id },
        include: categoryInclude,
      }),
    ),

  create: protectedProcedure.input(createCategoryInput).mutation(({ ctx, input }) => {
    const { subcategories, ...scalars } = input;
    return ctx.db.category.create({
      data: {
        ...scalars,
        subcategories: { connect: subcategories.map((id) => ({ id })) },
      },
    });
  }),

  update: protectedProcedure
    .input(zodRussian.object({ id: zodRussian.string(), data: categoryFieldsInput }))
    .mutation(async ({ ctx, input }) => {
      const { subcategories, ...scalars } = input.data;
      await ctx.db.category.update({
        where: { id: input.id },
        data: {
          ...scalars,
          // set — полная замена состава связи по списку id из формы
          subcategories: { set: subcategories.map((id) => ({ id })) },
        },
      });
      return true;
    }),

  delete: protectedProcedure
    .input(zodRussian.object({ id: zodRussian.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.category.delete({ where: { id: input.id } });
      return true;
    }),
});
