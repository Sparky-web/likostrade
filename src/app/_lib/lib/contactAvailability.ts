import { typo } from "lib";

const EKB_TIMEZONE = "Asia/Yekaterinburg";
const WORKDAY_START_MINUTES = 9 * 60;
const WORKDAY_END_MINUTES = 17 * 60;

const WEEKDAY_SHORT_TO_NUMBER: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

type EkaterinburgNow = {
  weekday: number;
  minutesSinceMidnight: number;
};

const getEkaterinburgNow = (now: Date): EkaterinburgNow => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: EKB_TIMEZONE,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(now)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const weekday = WEEKDAY_SHORT_TO_NUMBER[parts.weekday ?? ""];
  if (weekday == null) {
    throw new Error(typo(`Не удалось определить день недели по часовому поясу Екатеринбурга`));
  }

  return {
    weekday,
    minutesSinceMidnight: Number(parts.hour) * 60 + Number(parts.minute),
  };
};

const isWorkday = (weekday: number) => weekday >= 1 && weekday <= 5;

const isDuringWorkHours = ({ weekday, minutesSinceMidnight }: EkaterinburgNow) =>
  isWorkday(weekday) && minutesSinceMidnight >= WORKDAY_START_MINUTES && minutesSinceMidnight < WORKDAY_END_MINUTES;

/** Ответ в понедельник — после пятницы 16:00, вне смены в пятницу и на выходных. */
const respondsOnMonday = ({ weekday, minutesSinceMidnight }: EkaterinburgNow, duringWorkHours: boolean) => {
  if (weekday === 6 || weekday === 0) return true;
  if (weekday === 5) {
    return !duringWorkHours || WORKDAY_END_MINUTES - minutesSinceMidnight <= 60;
  }
  return false;
};

export type ContactAvailability = {
  phoneSecondary: string;
  emailSecondary: string;
  isPhoneOnline: boolean;
};

export const getContactAvailability = (now = new Date()): ContactAvailability => {
  const ekbNow = getEkaterinburgNow(now);
  const duringWorkHours = isDuringWorkHours(ekbNow);
  const replyOnMonday = respondsOnMonday(ekbNow, duringWorkHours);
  const replyLaterLabel = replyOnMonday ? typo(`ответим в понедельник`) : typo(`ответим завтра`);

  if (duringWorkHours) {
    const minutesUntilWorkEnd = WORKDAY_END_MINUTES - ekbNow.minutesSinceMidnight;

    return {
      isPhoneOnline: true,
      phoneSecondary: typo(`сейчас на связи`),
      emailSecondary: minutesUntilWorkEnd > 60 ? typo(`ответим в течение часа`) : replyLaterLabel,
    };
  }

  return {
    isPhoneOnline: false,
    phoneSecondary: typo(`ответим в рабочие дни с 9 до 17 часов по Екатеринбургу`),
    emailSecondary: replyLaterLabel,
  };
};
