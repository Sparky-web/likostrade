import { cache } from "react";

import { api } from "~/trpc/server";

/** Прайс резки один раз на запрос: калькулятор и таблица цен на одной странице делят результат. */
export const getCuttingPublic = cache(() => api.cutting.getPublic());
