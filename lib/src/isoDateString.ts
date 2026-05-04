import { typo } from "./typo";
import { zodRussian } from "./zodRussian";

/** Календарная дата YYYY-MM-DD без времени и часовых поясов. */
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const isoDateStringSchema = zodRussian
  .string()
  .regex(ISO_DATE_PATTERN, typo("Формат даты: ГГГГ-ММ-ДД"));
