import type { PropsWithChildren } from "react";

import { cn } from "~/components/utils/cn";

import {
  type StackAlignItems,
  stackAlignItemsClasses,
  type StackGap,
  stackGapClasses,
  type StackJustifyContent,
  stackJustifyContentClasses,
} from "../utils/consts";

export interface HStackProps extends PropsWithChildren, React.HTMLAttributes<HTMLDivElement> {
  align?: StackAlignItems;
  gap?: StackGap;
  justify?: StackJustifyContent;
}

export const HStack = ({ children, className, align, gap, justify, ...props }: HStackProps) => {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-row",
        gap && stackGapClasses[gap],
        align && stackAlignItemsClasses[align],
        justify && stackJustifyContentClasses[justify],
        className,
      )}
    >
      {children}
    </div>
  );
};
