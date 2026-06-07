"use client";

import { typo } from "lib";
import type { ReactNode } from "react";

import { Button } from "~/components";

import { REQUEST_FORM_SECTION_ID } from "../lib/requestFormSectionId";

type RequestFormScrollButtonProps = {
  children?: ReactNode;
  className?: string;
};

export const RequestFormScrollButton = ({
  children = typo("Оформить заявку"),
  className = "rounded-md",
}: RequestFormScrollButtonProps) => {
  const scrollToRequestForm = () => {
    document.getElementById(REQUEST_FORM_SECTION_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Button size="lg" className={className} type="button" onClick={scrollToRequestForm}>
      {children}
    </Button>
  );
};
