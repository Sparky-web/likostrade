import "server-only";

import type { Prisma, PrismaClient } from "generated/prisma";
import type { GetResult } from "generated/prisma/runtime/library";
import type { z } from "zod";

import { type adminProcedure, createTRPCRouter, type protectedProcedure, type publicProcedure } from "~/server/api/trpc";

import { zodRussian } from "./zodRussian";

const uncapitalizeModelName = <M extends string>(m: M): Uncapitalize<M> =>
  (m.charAt(0).toLowerCase() + m.slice(1)) as Uncapitalize<M>;

// Типы из Prisma TypeMap: корректные args и payload для дженериков
type PTypeMap = Prisma.TypeMap;
type ModelName = Prisma.ModelName;
type GetPayloadFor<M extends ModelName> = PTypeMap["model"][M]["payload"];
type PrismaGlobalOmitOptions = PTypeMap["globalOmitOptions"];

// Ключи делегатов в PrismaClient (post, user, verificationToken, …) — не путать с `keyof PrismaClient` ($connect и т.д.)
type PrismaModelKey = PTypeMap["meta"]["modelProps"];
type PrismaModelDelegateName<M extends ModelName> = Uncapitalize<M> & PrismaModelKey;

/** Строка из findMany: тип из `Prisma` + `findManyArgs` (напр. `select`) */
export type GetFindManyOutput<M extends ModelName, A> = GetResult<GetPayloadFor<M>, A, "findMany", PrismaGlobalOmitOptions>;
/** Один объект по id из findUnique + `findUniqueArgs` (напр. `select`) */
export type GetFindUniqueOutput<M extends ModelName, A> = GetResult<
  GetPayloadFor<M>,
  A,
  "findUnique",
  PrismaGlobalOmitOptions
> | null;
export type GetCreateOutput<M extends ModelName, A> = GetResult<GetPayloadFor<M>, A, "create", PrismaGlobalOmitOptions>;

type FindManyArgsFor<M extends ModelName> = PTypeMap["model"][M]["operations"]["findMany"]["args"];
type FindUniqueArgsFor<M extends ModelName> = PTypeMap["model"][M]["operations"]["findUnique"]["args"];
type CreateArgsFor<M extends ModelName> = PTypeMap["model"][M]["operations"]["create"]["args"];
type UpdateArgsFor<M extends ModelName> = PTypeMap["model"][M]["operations"]["update"]["args"];

type CreateDataFor<M extends ModelName> = CreateArgsFor<M> extends { data: infer D } ? D : never;
type UpdateDataFor<M extends ModelName> = UpdateArgsFor<M> extends { data: infer D } ? D : never;

/**
 * Данные create: у полей из `relationFields` на вход допускается только `string[]` (id → `connect` на сервере).
 */
export type TableRouterCreateDataInput<
  M extends ModelName,
  RF extends readonly (keyof CreateDataFor<M> & keyof UpdateDataFor<M>)[] = readonly [],
> = Omit<CreateDataFor<M>, RF[number]> & {
  [K in RF[number]]?: string[];
};

/** Данные update: те же ограничения для relation-ключей из `RF`. */
export type TableRouterUpdateDataInput<
  M extends ModelName,
  RF extends readonly (keyof CreateDataFor<M> & keyof UpdateDataFor<M>)[] = readonly [],
> = Omit<UpdateDataFor<M>, RF[number]> & {
  [K in RF[number]]?: string[];
};

type WhereForFindManyInput<M extends ModelName> = FindManyArgsFor<M> extends { where?: infer W } | undefined ? W : never;
type OrderByForFindManyInput<M extends ModelName> = FindManyArgsFor<M> extends { orderBy?: infer O } ? O : never;

/**
 * Prisma: при обобщённом M индекс `db[uncapitalize(M)]` даёт union; в рантайме — один delegate.
 */
type PrismaModelDelegate = {
  findMany: (args: unknown) => Promise<unknown>;
  findUnique: (args: unknown) => Promise<unknown>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
};

const getModelDelegate = (db: PrismaClient, name: string): PrismaModelDelegate =>
  (db as unknown as Record<string, PrismaModelDelegate | undefined>)[name]!;

/** Массивы id на верхнем уровне трактуем как Prisma `connect` (M2M и аналоги). */
const relationArraysToConnect = (raw: object, isCreate?: boolean): Record<string, unknown> =>
  Object.entries({ ...raw }).reduce(
    (acc, [key, value]) => {
      if (Array.isArray(value)) {
        if (isCreate) {
          acc[key] = {
            connect: value.map((id) => ({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              id,
            })),
          };
        } else {
          acc[key] = {
            set: value.map((id) => ({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              id,
            })),
          };
        }
      } else {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );

export type CreateTableRouterProcedure = typeof publicProcedure | typeof protectedProcedure | typeof adminProcedure;

type ProceduresMap = {
  get: CreateTableRouterProcedure;
  getById: CreateTableRouterProcedure;
  create: CreateTableRouterProcedure;
  update: CreateTableRouterProcedure;
  delete: CreateTableRouterProcedure;
};

// Внутренние схемы: рантайм — unknown(); тип входа задаётся `RF` (relation только как массив id строк)
const createDataZod = <
  M extends ModelName,
  RF extends readonly (keyof CreateDataFor<M> & keyof UpdateDataFor<M>)[] = readonly [],
>(): z.ZodType<TableRouterCreateDataInput<M, RF>> => zodRussian.unknown() as z.ZodType<TableRouterCreateDataInput<M, RF>>;

const updateDataZod = <
  M extends ModelName,
  RF extends readonly (keyof CreateDataFor<M> & keyof UpdateDataFor<M>)[] = readonly [],
>(): z.ZodType<TableRouterUpdateDataInput<M, RF>> => zodRussian.unknown() as z.ZodType<TableRouterUpdateDataInput<M, RF>>;

type CreateTableRouterConfig<
  M extends ModelName,
  FM extends FindManyArgsFor<M> = object,
  FU extends Omit<FindUniqueArgsFor<M>, "where"> = Omit<FindUniqueArgsFor<M>, "where">,
  CA extends Omit<CreateArgsFor<M>, "data"> = Omit<CreateArgsFor<M>, "data">,
  UA extends Omit<UpdateArgsFor<M>, "where" | "data"> = Omit<UpdateArgsFor<M>, "where" | "data">,
  RF extends readonly (keyof CreateDataFor<M> & keyof UpdateDataFor<M>)[] = readonly [],
> = {
  /** Имя модели из Prisma schema (PascalCase), напр. "Document" или "Post" */
  dbTable: M;
  procedures: ProceduresMap;
  findManyArgs?: FM;
  findUniqueArgs?: FU;
  createArgs?: CA;
  updateArgs?: UA;
  /** Сортировка по умолчанию для `get`; `findManyArgs.orderBy` переопределяет это значение. */
  orderBy?: OrderByForFindManyInput<M>;
  /**
   * Relation-поля: на вход create/update — только массив id (`string[]`).
   * Выведение типов: `relationFields: [...] as const` или 6-й type-аргумент `RF`.
   */
  relationFields?: RF;
};

/**
 * CRUD-роутер вокруг Prisma-модели: типы args/результатов согласованы с `Prisma.TypeMap`.
 * `dbTable` — то же, что `Prisma.ModelName` (PascalCase); на клиенте delegate = uncapitalize.
 * Шестой дженерик `RF`: список relation-полей, которые на вход `create`/`update` задаются только как `string[]` id
 * (`relationArraysToConnect` превращает в `connect`). Без него вход совпадает с Prisma `data`.
 */
export const createTableRouter = <
  M extends ModelName,
  FM extends FindManyArgsFor<M> = object,
  FU extends Omit<FindUniqueArgsFor<M>, "where"> = Omit<FindUniqueArgsFor<M>, "where">,
  CA extends Omit<CreateArgsFor<M>, "data"> = Omit<CreateArgsFor<M>, "data">,
  UA extends Omit<UpdateArgsFor<M>, "where" | "data"> = Omit<UpdateArgsFor<M>, "where" | "data">,
  RF extends readonly (keyof CreateDataFor<M> & keyof UpdateDataFor<M>)[] = readonly [],
>({
  findManyArgs: findManyArgsIn,
  dbTable,
  findUniqueArgs: findUniqueArgsIn,
  createArgs: createArgsIn,
  updateArgs: updateArgsIn,
  orderBy: orderByIn,
  procedures,
}: CreateTableRouterConfig<M, FM, FU, CA, UA, RF>) => {
  const findManyArgs = findManyArgsIn ?? ({} as FM);
  const findUniqueArgs = findUniqueArgsIn ?? ({} as FU);
  const createArgs = createArgsIn ?? ({} as CA);
  const updateArgs = updateArgsIn ?? ({} as UA);
  const defaultOrderBy = orderByIn ?? ({ id: "desc" } as OrderByForFindManyInput<M>);

  const delegateName = uncapitalizeModelName(dbTable) as PrismaModelDelegateName<M>;

  const get = procedures.get
    .input(
      zodRussian
        .object({
          where: zodRussian.custom<WhereForFindManyInput<M>>((v): v is WhereForFindManyInput<M> => true).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }): Promise<GetFindManyOutput<M, FM>> => {
      const model = getModelDelegate(ctx.db, delegateName);
      return (await model.findMany({
        orderBy: defaultOrderBy,
        ...(input?.where ? { where: input.where } : {}),
        ...findManyArgs,
      })) as GetFindManyOutput<M, FM>;
    });

  const getById = procedures.getById
    .input(zodRussian.object({ id: zodRussian.number().or(zodRussian.string()) }))
    .query(async ({ ctx, input }) => {
      const model = getModelDelegate(ctx.db, delegateName);
      return (await model.findUnique({
        where: { id: input.id },
        ...findUniqueArgs,
      })) as GetFindUniqueOutput<M, FU & { where: { id: string } }>;
    });

  const create = procedures.create
    .input(createDataZod<M, RF>())
    .mutation(async ({ ctx, input }): Promise<GetCreateOutput<M, CA & { data: CreateDataFor<M> }>> => {
      const model = getModelDelegate(ctx.db, delegateName);
      const dataParsed = relationArraysToConnect(input as object, true);
      return (await model.create({
        data: dataParsed,
        ...createArgs,
      })) as GetCreateOutput<M, CA & { data: CreateDataFor<M> }>;
    });

  const update = procedures.update
    .input(
      zodRussian.object({
        id: zodRussian.string(),
        data: updateDataZod<M, RF>(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<boolean> => {
      const { id, data: raw } = input!;
      const d = { ...(raw as object) } as UpdateDataFor<M> & { id?: unknown };

      if (d.id !== undefined) {
        delete (d as { id?: unknown }).id;
      }

      const model = getModelDelegate(ctx.db, delegateName);
      const dataParsed = relationArraysToConnect(d);

      await model.update({
        where: { id },
        data: dataParsed,
        ...updateArgs,
      });
      return true;
    });

  const del = procedures.delete
    .input(zodRussian.object({ id: zodRussian.string() }))
    .mutation(async ({ ctx, input }): Promise<boolean> => {
      const model = getModelDelegate(ctx.db, delegateName);
      await model.delete({
        where: { id: input.id },
      });
      return true;
    });

  return createTRPCRouter({
    get,
    getById,
    create,
    update,
    delete: del,
  });
};
