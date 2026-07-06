"use client";

import { typo } from "lib";
import { useState } from "react";

import { Button, Text } from "~/components";

import { RequestFormDialog } from "../components/RequestFormDialog";

type RequestQuoteBlockProps = {
  categoryId: string;
};

/** Полоса «Запрос цены»: кнопка + приглашение, по клику — модалка с формой заявки категории. */
export const RequestQuoteBlock = ({ categoryId }: RequestQuoteBlockProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="bg-secondary flex flex-col items-start gap-6 rounded-xl p-6 md:flex-row md:items-center md:p-8">
        <Button size="lg" className="shrink-0" onClick={() => setIsOpen(true)}>
          {typo("Запрос цены")}
        </Button>
        <Text variant="large">
          {typo("Оформите заявку на сайте, мы свяжемся с вами в ближайшее время и ответим на все интересующие вопросы.")}
        </Text>
      </div>

      <RequestFormDialog open={isOpen} onOpenChange={setIsOpen} categoryId={categoryId} />
    </>
  );
};
