"use client";

import { typo } from "lib";
import { type ReactNode, useState } from "react";

import { Button } from "~/components";

import { REQUEST_FORM_SECTION_ID } from "../lib/requestFormSectionId";
import { RequestFormDialog } from "./RequestFormDialog";

type CategoryCtaButtonProps = {
  categoryId: string;
  /** Есть ли на странице инлайн-форма заявки (её якорь). Если да — скроллим к ней, иначе открываем модалку. */
  hasInlineForm: boolean;
  children?: ReactNode;
  className?: string;
};

/** CTA категории: при наличии инлайн-формы скроллит к ней, иначе открывает модалку — не бывает «мёртвой» кнопки. */
export const CategoryCtaButton = ({
  categoryId,
  hasInlineForm,
  children = typo("Оформить заявку"),
  className = "rounded-md",
}: CategoryCtaButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (hasInlineForm) {
      document.getElementById(REQUEST_FORM_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <Button size="lg" className={className} type="button" onClick={handleClick}>
        {children}
      </Button>
      {!hasInlineForm ? <RequestFormDialog open={isOpen} onOpenChange={setIsOpen} categoryId={categoryId} /> : null}
    </>
  );
};
