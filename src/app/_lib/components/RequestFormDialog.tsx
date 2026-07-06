"use client";

import { typo } from "lib";

import { Dialog, DialogContent, DialogTitle } from "~/components";

import type { RequestFormCardProps } from "./RequestFormCard";
import { RequestFormCard } from "./RequestFormCard";

type RequestFormDialogProps = Pick<RequestFormCardProps, "categoryId" | "projectId" | "calcItems" | "onSuccess"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Модалка с формой заявки — используется блоком «Запрос цены» и калькулятором резки. */
export const RequestFormDialog = ({ open, onOpenChange, ...cardProps }: RequestFormDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] w-full max-w-lg overflow-y-auto border-0 bg-transparent p-0 shadow-none">
      <DialogTitle className="sr-only">{typo("Оставить заявку")}</DialogTitle>
      <RequestFormCard {...cardProps} />
    </DialogContent>
  </Dialog>
);
