import { typo } from "lib";
import { AlertTriangle, Loader } from "lucide-react";
import React from "react";

import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";

interface PopConfirmProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isPending?: boolean;
  children: React.ReactNode;
}

export function PopConfirm({
  title = typo(`Вы уверены?`),
  description = typo(`Действие необратимо.`),
  onConfirm,
  onCancel = () => undefined,
  children,
  isPending = false,
}: PopConfirmProps) {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const handleCancel = () => {
    onCancel();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="end">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h4 className="font-medium">{title}</h4>
        </div>
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
        <div className="mt-4 flex justify-end space-x-2">
          <Button size="xs" onClick={handleCancel}>
            {typo("Закрыть")}
          </Button>
          <Button variant="destructive" size="xs" onClick={handleConfirm} disabled={isPending}>
            {isPending ? <Loader className="h-4 w-4 animate-spin" /> : typo(`Подтвердить`)}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
