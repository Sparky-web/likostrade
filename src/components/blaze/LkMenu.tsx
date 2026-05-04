"use client";
import { usePathname } from "next/navigation";

import { cn } from "../utils/cn";
import { Link } from "./Link";
import { SimpleCard } from "./SimpleCard";
import { VStack } from "./VStack";

export type MenuItem = {
  title: string;
  children?: MenuItem[];
} & (
  | {
      href: string;
    }
  | {
      onClick: () => void;
    }
);

interface LkMenuProps {
  items: MenuItem[];
  title?: string;
}

export const LkMenu = ({ items, title }: LkMenuProps) => {
  const pathname = usePathname();

  return (
    <SimpleCard title={title}>
      <VStack gap="md">
        {items.map((item) => {
          return (
            <Link
              href={"href" in item ? item.href : "#"}
              onClick={() => "onClick" in item && item.onClick()}
              className={cn("href" in item && item.href === pathname ? "text-primary" : "")}
              key={item.title}
            >
              {item.title}
            </Link>
          );
        })}
      </VStack>
    </SimpleCard>
  );
};
