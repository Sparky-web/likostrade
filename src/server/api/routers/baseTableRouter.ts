import { zodRussian } from "lib";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const baseTableRouter = createTRPCRouter({
  get: publicProcedure.input(zodRussian.any().optional()).query(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return [] as any[];
  }),
  getById: publicProcedure.input(zodRussian.object({ id: zodRussian.string() })).query(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return {} as any;
  }),
  create: publicProcedure.input(zodRussian.any()).mutation(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return { id: 0 } as any;
  }),
  update: publicProcedure.input(zodRussian.object({ id: zodRussian.any(), data: zodRussian.any() })).mutation(() => {
    return true as boolean;
  }),
  delete: publicProcedure.input(zodRussian.object({ id: zodRussian.any() })).mutation(() => {
    return true as boolean;
  }),
});
