import { TRPCError } from "@trpc/server";
import type { Prisma, PrismaClient } from "generated/prisma";
import { CategoryChildrenMode, CategoryHeaderMode } from "generated/prisma";
import { zodRussian } from "lib";

import { categorySectionsSchema, extractSectionFileIds } from "~/sections/schema";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

/** Категории и подкатегории везде отдаются в порядке каталога: sortOrder, затем алфавит. */
const catalogOrderBy = [{ sortOrder: "asc" }, { title: "asc" }] satisfies Prisma.CategoryOrderByWithRelationInput[];

const categoryInclude = {
  subcategories: { orderBy: catalogOrderBy },
  parentCategories: true,
  videos: true,
} satisfies Prisma.CategoryInclude;

/**
 * Поля формы категории; subcategories — массив id (самосвязная M2M).
 * parentCategories здесь не редактируются — задаются с противоположной стороны связи.
 */
const categoryFieldsInput = zodRussian.object({
  title: zodRussian.string().min(1),
  landingTitle: zodRussian.string().nullable(),
  shortDescription: zodRussian.string().nullable(),
  imageId: zodRussian.string().nullable(),
  isHidden: zodRussian.boolean(),
  headerMode: zodRussian.nativeEnum(CategoryHeaderMode),
  childrenMode: zodRussian.nativeEnum(CategoryChildrenMode),
  catalogTitle: zodRussian.string().nullable(),
  sortOrder: zodRussian.number().int(),
  sections: categorySectionsSchema,
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

/** Пустые строки из формы храним как NULL: публичные страницы полагаются на `??` и truthiness. */
const emptyToNull = (value: string | null) => (value === null || value.trim() === "" ? null : value);

type CategoryFields = (typeof categoryFieldsInput)["_output"];

/** Скаляры для Prisma из провалидированной формы (без subcategories — это связь). */
function toCategoryScalars(fields: CategoryFields) {
  const { subcategories: _subcategories, sections, ...rest } = fields;
  return {
    ...rest,
    landingTitle: emptyToNull(fields.landingTitle),
    shortDescription: emptyToNull(fields.shortDescription),
    catalogTitle: emptyToNull(fields.catalogTitle),
    sections: sections as Prisma.InputJsonValue,
  };
}

/**
 * Дерево категорий строгое: у ребёнка один родитель, циклов нет. В БД связь M2M и сама
 * по себе этого не гарантирует, а на инварианте стоят хлебные крошки и сайдбар каталога —
 * поэтому проверяем при каждой записи состава подкатегорий (граф маленький, это дёшево).
 */
async function assertStrictTree(db: PrismaClient, categoryId: string | null, childIds: string[]) {
  if (childIds.length === 0) return;

  if (categoryId !== null && childIds.includes(categoryId)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Категория не может быть собственной подкатегорией" });
  }

  const all = await db.category.findMany({
    select: { id: true, title: true, subcategories: { select: { id: true } } },
  });
  const byId = new Map(all.map((category) => [category.id, category]));

  for (const category of all) {
    if (category.id === categoryId) continue;
    const takenChild = category.subcategories.find((sub) => childIds.includes(sub.id));
    if (takenChild) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `«${byId.get(takenChild.id)?.title ?? takenChild.id}» уже входит в «${category.title}» — сначала уберите её оттуда`,
      });
    }
  }

  if (categoryId !== null) {
    // Цикл возник бы, будь редактируемая категория потомком одного из подключаемых детей
    const stack = [...childIds];
    const visited = new Set<string>();
    while (stack.length > 0) {
      const id = stack.pop();
      if (id === undefined || visited.has(id)) continue;
      visited.add(id);
      for (const sub of byId.get(id)?.subcategories ?? []) {
        if (sub.id === categoryId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Нельзя: «${byId.get(id)?.title ?? id}» — потомок редактируемой категории, получился бы цикл`,
          });
        }
        stack.push(sub.id);
      }
    }
  }
}

/** Файловые секции должны ссылаться на существующие записи File. */
async function assertSectionFilesExist(db: PrismaClient, sections: CategoryFields["sections"]) {
  const fileIds = [...new Set(extractSectionFileIds(sections))];
  if (fileIds.length === 0) return;

  const existing = await db.file.findMany({ where: { id: { in: fileIds } }, select: { id: true } });
  const existingIds = new Set(existing.map((file) => file.id));
  const missing = fileIds.filter((id) => !existingIds.has(id));
  if (missing.length > 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Файлы не найдены: ${missing.join(", ")}` });
  }
}

export const categoriesRouter = createTRPCRouter({
  get: publicProcedure.input(getCategoriesInput).query(({ ctx, input }) =>
    ctx.db.category.findMany({
      where: input?.where,
      orderBy: catalogOrderBy,
      include: categoryInclude,
    }),
  ),

  /** Лёгкий срез всех категорий для дерева/крошек/сайдбара — без sections и видео. */
  getTree: publicProcedure.query(({ ctx }) =>
    ctx.db.category.findMany({
      orderBy: catalogOrderBy,
      select: {
        id: true,
        title: true,
        isHidden: true,
        childrenMode: true,
        sortOrder: true,
        parentCategories: { select: { id: true } },
        subcategories: { select: { id: true } },
      },
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

  create: protectedProcedure.input(createCategoryInput).mutation(async ({ ctx, input }) => {
    const { id, ...fields } = input;
    await assertStrictTree(ctx.db, null, fields.subcategories);
    await assertSectionFilesExist(ctx.db, fields.sections);
    return ctx.db.category.create({
      data: {
        id,
        ...toCategoryScalars(fields),
        subcategories: { connect: fields.subcategories.map((subId) => ({ id: subId })) },
      },
    });
  }),

  update: protectedProcedure
    .input(zodRussian.object({ id: zodRussian.string(), data: categoryFieldsInput }))
    .mutation(async ({ ctx, input }) => {
      await assertStrictTree(ctx.db, input.id, input.data.subcategories);
      await assertSectionFilesExist(ctx.db, input.data.sections);
      await ctx.db.category.update({
        where: { id: input.id },
        data: {
          ...toCategoryScalars(input.data),
          // set — полная замена состава связи по списку id из формы
          subcategories: { set: input.data.subcategories.map((subId) => ({ id: subId })) },
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
