"use client";

import { type PropsWithChildren, type ReactNode, useCallback, useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { cn } from "~/components/utils/cn";

import { ScrollArea } from "../ui/scroll-area";

interface SidePanelInterface extends PropsWithChildren {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  buttons?: ReactNode;
}

export function SidePanel({ children, isOpen, onClose, className, title, buttons }: SidePanelInterface) {
  const [buttonsHeight, setButtonsHeight] = useState(0);

  // callback ref срабатывает синхронно при монтировании узла внутри портала Radix —
  // в отличие от useEffect, гарантирует получение размеров с первого рендера
  const buttonsRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      setButtonsHeight(0);
      return;
    }

    setButtonsHeight(node.getBoundingClientRect().height);

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setButtonsHeight(entry.contentRect.height);
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "data-[state=closed]:!zoom-out-100 data-[state=open]:!zoom-in-100 data-[state=closed]:!slide-out-to-top-0 data-[state=closed]:slide-out-to-right-1/2 data-[state=open]:!slide-in-from-top-0 data-[state=open]:slide-in-from-right-1/2 top-0 right-0 left-[initial] h-full max-h-[100dvh] translate-x-[0] translate-y-0 content-start !overflow-hidden !overflow-y-hidden !rounded-l-2xl !rounded-r-none md:w-[625px] md:!max-w-[625px]",
          className,
        )}
      >
        <DialogHeader>
          <DialogTitle className="pl-1">{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea
          style={{
            height: `calc(100dvh - 24px * 2 - 16px - 24px * 2 - ${buttonsHeight}px)`,
          }}
        >
          <div className="py-1 pr-3 pl-1">{children}</div>
        </ScrollArea>
        {buttons && <div ref={buttonsRef}>{buttons}</div>}
      </DialogContent>
    </Dialog>
  );
}
