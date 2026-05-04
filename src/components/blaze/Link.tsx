import { cva } from "class-variance-authority";
import NextLink from "next/link";
import type { ComponentProps } from "react";

import { cn } from "~/components/utils/cn";

export type LinkProps = ComponentProps<typeof NextLink> & {
  variant?: "default" | "secondary" | "insideText" | "underline";
};

const linkVariants = cva("w-fit", {
  variants: {
    variant: {
      default: "text-foreground hover:text-foreground/85",
      secondary: "text-secondary-foreground hover:text-foreground",
      insideText: "text-primary hover:text-secondary-foreground",
      underline: "text-foreground hover:text-foreground/85 underline underline-offset-4",
    },
  },
});

export const Link = ({ className, variant = "default", ...props }: LinkProps) => {
  return <NextLink className={cn(linkVariants({ variant }), className)} {...props} />;
};
