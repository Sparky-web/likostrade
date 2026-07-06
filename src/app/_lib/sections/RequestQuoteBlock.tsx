"use client";

import { typo } from "lib";
import { useState } from "react";

import { Button, Dialog, DialogContent, DialogTitle, Text } from "~/components";

import { RequestFormCard } from "../components/RequestFormCard";

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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90dvh] w-full max-w-lg overflow-y-auto border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{typo("Оставить заявку")}</DialogTitle>
          <RequestFormCard categoryId={categoryId} onSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
