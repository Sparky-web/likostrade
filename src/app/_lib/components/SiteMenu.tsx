"use client";

import { formatPhoneNumber, typo } from "lib";
import { ChevronDown, MapPin, Menu, Phone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { createContext, Fragment, type ReactNode,useContext, useEffect, useRef, useState } from "react";

import {
  Button,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Container,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  HStack,
  Link,
  Logo,
  Text,
  useCategoryTreeData,
  VStack,
} from "~/components";
import type { CategoryTreeNode } from "~/components/custom/CategoryTreeCombobox/lib/buildCategoryTree";

import { SITE_ADDRESS, SITE_EMAIL, SITE_MAP_URL, SITE_NAV_ITEMS, SITE_PHONE, SITE_SERVICES_NAV_LABEL } from "../model/siteMenu";
import { EmailCopy } from "./EmailCopy";

const MOBILE_HEADER_H_PX = 80;
const DROPDOWN_HOVER_CLOSE_MS = 120;
const DROPDOWN_SUPPRESS_RESET_MS = 400;

/** Единая строка мобильного меню. */
const siteMenuMobileRowClassName =
  "border-border text-foreground hover:text-primary flex h-16 w-full items-center gap-3 border-b text-lg transition-colors";

/** Смещение единственного вложенного уровня в мобильном меню услуг. */
const siteMenuMobileNestedIndentClassName = "pl-5";

/** Пункт desktop dropdown. */
const siteMenuDropdownRowClassName = "text-popover-foreground flex min-h-9 w-full items-center rounded-xl px-3 py-2 text-sm";

type DropdownHoverZoneProps = {
  onPointerEnter: () => void;
  onPointerLeave: () => void;
};

const DropdownHoverZoneContext = createContext<DropdownHoverZoneProps | null>(null);

function useDropdownHoverZone() {
  const zone = useContext(DropdownHoverZoneContext);
  if (zone == null) {
    throw new Error("useDropdownHoverZone must be used within DropdownHoverRoot");
  }
  return zone;
}

/** Hover-dropdown: открытие только с зоны меню, после клика — без повторного открытия до ухода курсора. */
function useDropdownHover() {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressHoverOpenRef = useRef(false);

  const clearTimers = () => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (suppressResetTimerRef.current != null) {
      clearTimeout(suppressResetTimerRef.current);
      suppressResetTimerRef.current = null;
    }
  };

  const onPointerEnter = () => {
    clearTimers();
    if (!suppressHoverOpenRef.current) {
      setOpen(true);
    }
  };

  const onPointerLeave = () => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => setOpen(false), DROPDOWN_HOVER_CLOSE_MS);
    suppressResetTimerRef.current = setTimeout(() => {
      suppressHoverOpenRef.current = false;
    }, DROPDOWN_SUPPRESS_RESET_MS);
  };

  const closeMenu = () => {
    clearTimers();
    suppressHoverOpenRef.current = true;
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setOpen(false);
    }
  };

  useEffect(() => clearTimers, []);

  const zoneProps = { onPointerEnter, onPointerLeave };

  return { open, closeMenu, handleOpenChange, zoneProps };
}

type DropdownHoverRootProps = {
  open: boolean;
  handleOpenChange: (open: boolean) => void;
  zoneProps: DropdownHoverZoneProps;
  children: ReactNode;
};

function DropdownHoverRoot({ open, handleOpenChange, zoneProps, children }: DropdownHoverRootProps) {
  return (
    <DropdownHoverZoneContext.Provider value={zoneProps}>
      <div className="relative" onPointerEnter={zoneProps.onPointerEnter} onPointerLeave={zoneProps.onPointerLeave}>
        <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={false}>
          {children}
        </DropdownMenu>
      </div>
    </DropdownHoverZoneContext.Provider>
  );
}

function DropdownMenuHoverSurface({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  const zone = useDropdownHoverZone();

  return (
    <DropdownMenuContent
      className={className}
      onPointerEnter={zone.onPointerEnter}
      onPointerLeave={zone.onPointerLeave}
      {...props}
    >
      {children}
    </DropdownMenuContent>
  );
}

function DropdownSubMenuHoverSurface({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuSubContent>) {
  const zone = useDropdownHoverZone();

  return (
    <DropdownMenuSubContent
      className={className}
      onPointerEnter={zone.onPointerEnter}
      onPointerLeave={zone.onPointerLeave}
      {...props}
    >
      {children}
    </DropdownMenuSubContent>
  );
}

type SiteMenuTreeNode = {
  key: string;
  label: string;
  href: string;
  children: SiteMenuTreeNode[];
};

function categoryTreeToMenuNodes(nodes: CategoryTreeNode[]): SiteMenuTreeNode[] {
  return nodes.map((node) => ({
    key: node.id,
    label: node.title,
    href: `/categories/${node.id}`,
    children: categoryTreeToMenuNodes(node.children),
  }));
}

type SiteAddressWithMapProps = {
  variant: "header" | "drawer";
  onNavigate?: () => void;
  className?: string;
};

function SiteAddressWithMap({ variant, onNavigate, className }: SiteAddressWithMapProps) {
  if (variant === "header") {
    return (
      <HStack gap="sm" className={cn("max-w-[300px]", className)}>
        <MapPin className="text-primary min-w-4" />
        <VStack gap="2xs">
          <Text>{SITE_ADDRESS}</Text>
          <Link href={SITE_MAP_URL} onClick={onNavigate}>
            {typo(`на карту`)}
          </Link>
        </VStack>
      </HStack>
    );
  }

  return (
    <VStack gap="sm">
      <HStack gap="sm" className={cn("w-full", className)} justify="center">
        <MapPin className="text-primary min-w-4" />
        <Text>{SITE_ADDRESS}</Text>
      </HStack>

      <Link href={SITE_MAP_URL} onClick={onNavigate} className="w-full">
        <Button className="w-full" variant="secondary" size="lg">
          {typo(`на карту`)}
        </Button>
      </Link>
    </VStack>
  );
}

type SitePhoneAndEmailProps = {
  variant: "header" | "drawerPhone" | "drawerEmail";
  onNavigate?: () => void;
  className?: string;
};

function SitePhoneAndEmail({ variant, onNavigate, className }: SitePhoneAndEmailProps) {
  if (variant === "header") {
    return (
      <>
        <Link href={`tel:${SITE_PHONE}`} className="text-foreground font-semibold underline underline-offset-4">
          <Text variant="large">{formatPhoneNumber(SITE_PHONE)}</Text>
        </Link>
        <EmailCopy email={SITE_EMAIL} />
      </>
    );
  }

  if (variant === "drawerPhone") {
    return (
      <Link
        className={cn("text-foreground hover:text-primary flex items-center justify-center gap-2 py-3", className)}
        href={`tel:${SITE_PHONE}`}
        onClick={onNavigate}
      >
        <Phone className="h-4 w-4 shrink-0" />
        <span className="font-medium">{formatPhoneNumber(SITE_PHONE)}</span>
      </Link>
    );
  }

  return <EmailCopy email={SITE_EMAIL} className={cn("justify-center", className)} emailClassName="text-sm" />;
}

type SiteNavDesktopLinkProps = {
  href: string;
  label: string;
  isActive: boolean;
};

function SiteNavDesktopLink({ href, label, isActive }: SiteNavDesktopLinkProps) {
  return (
    <Button variant="ghost" asChild>
      <Link href={href} className={cn(isActive && "text-primary")}>
        <Text>{label}</Text>
      </Link>
    </Button>
  );
}

type SiteMenuMobileLinkProps = {
  href: string;
  label: string;
  isActive?: boolean;
  indented?: boolean;
  onNavigate: () => void;
};

function SiteMenuMobileLink({ href, label, isActive = false, indented = false, onNavigate }: SiteMenuMobileLinkProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(siteMenuMobileRowClassName, indented && siteMenuMobileNestedIndentClassName, isActive && "text-primary")}
    >
      <span className="flex-1">{label}</span>
    </Link>
  );
}

type SiteMenuMobileExpandableProps = {
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  href?: string;
  onNavigate?: () => void;
};

function SiteMenuMobileExpandable({ label, open, onOpenChange, children, href, onNavigate }: SiteMenuMobileExpandableProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="w-full">
      <CollapsibleTrigger asChild>
        <button type="button" className={cn(siteMenuMobileRowClassName, "cursor-pointer text-left")}>
          {href != null ? (
            <Link
              href={href}
              className="flex-1"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onNavigate?.();
              }}
            >
              {label}
            </Link>
          ) : (
            <span className="flex-1">{label}</span>
          )}
          <ChevronDown
            className={cn("text-muted-foreground size-5 shrink-0 transition-transform", open && "rotate-180")}
            aria-hidden
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="w-full">{children}</CollapsibleContent>
    </Collapsible>
  );
}

type SiteServicesDropdownItemsProps = {
  nodes: SiteMenuTreeNode[];
  onNavigate: () => void;
};

function SiteServicesDropdownItems({ nodes, onNavigate }: SiteServicesDropdownItemsProps) {
  const handleLinkClick = () => {
    onNavigate();
  };

  return nodes.map((node) =>
    node.children.length > 0 ? (
      <DropdownMenuSub key={node.key}>
        <DropdownMenuSubTrigger className={cn(siteMenuDropdownRowClassName, "cursor-default p-0")}>
          <Link
            href={node.href}
            className="hover:text-popover-foreground/85 flex min-h-9 flex-1 items-center self-stretch px-3 py-2 text-inherit"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={handleLinkClick}
          >
            {typo(node.label)}
          </Link>
        </DropdownMenuSubTrigger>
        <DropdownSubMenuHoverSurface>
          <SiteServicesDropdownItems nodes={node.children} onNavigate={onNavigate} />
        </DropdownSubMenuHoverSurface>
      </DropdownMenuSub>
    ) : (
      <DropdownMenuItem
        asChild
        key={node.key}
        onSelect={(event) => {
          event.preventDefault();
          onNavigate();
        }}
      >
        <Link href={node.href} className={siteMenuDropdownRowClassName} onClick={handleLinkClick}>
          {typo(node.label)}
        </Link>
      </DropdownMenuItem>
    ),
  );
}

type SiteServicesDesktopMenuProps = {
  nodes: SiteMenuTreeNode[];
};

function SiteServicesDesktopMenu({ nodes }: SiteServicesDesktopMenuProps) {
  const hover = useDropdownHover();

  if (nodes.length === 0) {
    return (
      <Button variant="ghost" disabled>
        <Text>{SITE_SERVICES_NAV_LABEL}</Text>
      </Button>
    );
  }

  return (
    <DropdownHoverRoot open={hover.open} handleOpenChange={hover.handleOpenChange} zoneProps={hover.zoneProps}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <Text>{SITE_SERVICES_NAV_LABEL}</Text>
          <ChevronDown className="size-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuHoverSurface align="center" sideOffset={4} className="max-h-80 min-w-56">
        <SiteServicesDropdownItems nodes={nodes} onNavigate={hover.closeMenu} />
      </DropdownMenuHoverSurface>
    </DropdownHoverRoot>
  );
}

type SiteServicesMobileNodesProps = {
  nodes: SiteMenuTreeNode[];
  onNavigate: () => void;
};

/** Мобильное меню услуг: только корневые категории со смещением относительно основных пунктов. */
function SiteServicesMobileNodes({ nodes, onNavigate }: SiteServicesMobileNodesProps) {
  if (nodes.length === 0) return null;

  return (
    <div className="flex w-full flex-col">
      {nodes.map((node) => (
        <SiteMenuMobileLink
          key={node.key}
          href={node.href}
          label={node.label}
          indented
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

type SiteServicesMobileMenuProps = {
  nodes: SiteMenuTreeNode[];
  onNavigate: () => void;
  servicesOpen: boolean;
  onServicesOpenChange: (open: boolean) => void;
};

function SiteServicesMobileMenu({ nodes, onNavigate, servicesOpen, onServicesOpenChange }: SiteServicesMobileMenuProps) {
  if (nodes.length === 0) {
    return <div className={cn("text-muted-foreground", siteMenuMobileRowClassName)}>{SITE_SERVICES_NAV_LABEL}</div>;
  }

  return (
    <SiteMenuMobileExpandable
      label={SITE_SERVICES_NAV_LABEL}
      open={servicesOpen}
      onOpenChange={onServicesOpenChange}
    >
      <SiteServicesMobileNodes nodes={nodes} onNavigate={onNavigate} />
    </SiteMenuMobileExpandable>
  );
}

function useServicesMenuNodes() {
  const { tree } = useCategoryTreeData();
  return categoryTreeToMenuNodes(tree);
}

export function SiteMenu() {
  const pathname = usePathname();
  const [isOpened, setIsOpened] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const serviceNodes = useServicesMenuNodes();

  const closeMobileMenu = () => {
    setIsOpened(false);
    setServicesOpen(false);
  };

  const renderNavWithServices = (variant: "mobile" | "desktop") =>
    SITE_NAV_ITEMS.map((item, index) => {
      const isActive = item.highlightWhenActive !== false && pathname === item.href;
      const insertServicesAfterAbout = index === 0;

      return (
        <Fragment key={item.href}>
          {variant === "mobile" ? (
            <SiteMenuMobileLink href={item.href} label={item.label} isActive={isActive} onNavigate={closeMobileMenu} />
          ) : (
            <SiteNavDesktopLink href={item.href} label={item.label} isActive={isActive} />
          )}
          {insertServicesAfterAbout &&
            (variant === "mobile" ? (
              <SiteServicesMobileMenu
                nodes={serviceNodes}
                onNavigate={closeMobileMenu}
                servicesOpen={servicesOpen}
                onServicesOpenChange={setServicesOpen}
              />
            ) : (
              <SiteServicesDesktopMenu nodes={serviceNodes} />
            ))}
        </Fragment>
      );
    });

  return (
    <>
      <div className="md:hidden">
        <div style={{ height: `${MOBILE_HEADER_H_PX}px` }} />

        <header
          className="bg-background fixed top-0 z-11 w-full shadow-md"
          style={{
            height: `${MOBILE_HEADER_H_PX}px`,
          }}
        >
          <Container className="h-full">
            <HStack justify="between" align="center" className="h-full">
              <Link href="/" className="inline-flex shrink-0" onClick={closeMobileMenu} aria-label={typo(`На главную`)}>
                <Logo size="xs" />
              </Link>
              <HStack justify="end" align="center" className="shrink-0">
                {/* Иконка-звонок: полный номер (с длинным «+7 (992) …») распирал шапку за 390px.
                    Номер доступен в выезжающем меню и футере. */}
                <Link href={`tel:${SITE_PHONE}`} onClick={closeMobileMenu} aria-label={typo(`Позвонить`)}>
                  <Button variant="ghost" size="icon">
                    <Phone />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="justify-self-end"
                  onClick={() => setIsOpened((o) => !o)}
                  aria-expanded={isOpened}
                  aria-label={isOpened ? typo(`Закрыть меню`) : typo(`Открыть меню`)}
                >
                  {isOpened ? <X /> : <Menu />}
                </Button>
              </HStack>
            </HStack>
          </Container>
        </header>

        <div
          className={cn(
            "bg-background fixed left-0 z-11 flex w-full -translate-x-full flex-col",
            "transition-transform duration-200 ease-out",
            isOpened && "translate-x-0",
          )}
          style={{
            top: MOBILE_HEADER_H_PX,
            height: `calc(100dvh - ${MOBILE_HEADER_H_PX}px)`,
          }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-10">
            <nav className="flex flex-col">{renderNavWithServices("mobile")}</nav>

            <div className="mt-6">
              <SiteAddressWithMap variant="drawer" onNavigate={closeMobileMenu} />
            </div>
            <VStack gap="sm" justify="center" className="mt-6 pb-6">
              <SitePhoneAndEmail variant="header" onNavigate={closeMobileMenu} />
            </VStack>
          </div>
        </div>
      </div>

      <header className="relative z-2 hidden md:block">
        <Container className="py-6">
          <VStack gap="xl">
            <div className="grid grid-cols-[1fr_auto_1fr]">
              <SiteAddressWithMap variant="header" />
              <Link href="/">
                <Logo withTitle />
              </Link>
              <VStack gap="sm" justify="end">
                <SitePhoneAndEmail variant="header" />
              </VStack>
            </div>
            <HStack gap="xs" justify="center" className="flex-wrap">
              {renderNavWithServices("desktop")}
            </HStack>
          </VStack>
        </Container>
      </header>
    </>
  );
}
