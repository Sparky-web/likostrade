"use client";

import { typo } from "lib";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button, HStack } from "~/components";

import { reachYandexMetrikaGoal, YANDEX_METRIKA_GOALS } from "../lib/yandexMetrika";

const COPY_LABEL = typo("Скопировать email");
const COPIED_LABEL = typo("Email скопирован");

type EmailCopyProps = {
  email: string;
  className?: string;
  /** Класс для текста email (наследует типографику окружения, если не задан). */
  emailClassName?: string;
  /**
   * Отправлять цели Яндекс.Метрики (`emailCopy` по клику, `emailSelect` по факту копирования).
   * Выключай на внутренних страницах (админка), чтобы не засорять конверсии.
   */
  trackGoals?: boolean;
};

/**
 * Email без `mailto:`-ссылки + маленькая ghost-кнопка копирования.
 * `emailCopy` — клик по кнопке, `emailSelect` — фактическое копирование
 * (как по кнопке, так и ручным выделением текста).
 */
export const EmailCopy = ({ email, className, emailClassName, trackGoals = true }: EmailCopyProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(resetTimerRef.current ?? undefined), []);

  const flashCopied = () => {
    setIsCopied(true);
    clearTimeout(resetTimerRef.current ?? undefined);
    resetTimerRef.current = setTimeout(() => setIsCopied(false), 2000);
  };

  // Ручное выделение и копирование email — те же цели emailCopy + emailSelect.
  const handleManualCopy = () => {
    if (!trackGoals) return;
    reachYandexMetrikaGoal(YANDEX_METRIKA_GOALS.emailCopy);
  };

  const handleCopyClick = async () => {
    if (trackGoals) reachYandexMetrikaGoal(YANDEX_METRIKA_GOALS.emailCopy);

    try {
      await navigator.clipboard.writeText(email);
      flashCopied();
    } catch {
      // буфер обмена недоступен — тихо игнорируем
    }
  };

  return (
    <HStack gap="xs" align="center" className={className}>
      <span className={emailClassName} onCopy={handleManualCopy}>
        {email}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={handleCopyClick}
        aria-label={isCopied ? COPIED_LABEL : COPY_LABEL}
        title={isCopied ? COPIED_LABEL : COPY_LABEL}
      >
        {isCopied ? <Check className="text-green-600" /> : <Copy />}
      </Button>
    </HStack>
  );
};
