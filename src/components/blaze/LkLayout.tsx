import type { PropsWithChildren } from "react";

import { Container } from "./Container";
import { LkMenu, type MenuItem } from "./LkMenu";

interface LkLayoutProps extends PropsWithChildren {
  menu?: {
    title: string;
    items: MenuItem[];
  };
}

export const LkLayout = ({ children, menu }: LkLayoutProps) => {
  return (
    <Container className="py-section">
      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        {menu && <LkMenu items={menu?.items} title={menu?.title} />}
        {children}
      </div>
    </Container>
  );
};
