import Image from "next/image";

import { Size } from "~/components/utils/consts";

import logoMarkImport from "./logo.svg";
import logoWithTitleImport from "./logoWithTitle.svg";

function svgImportHref(module: unknown): string {
  if (typeof module === "string") {
    return module;
  }
  if (typeof module === "object" && module !== null && "src" in module && typeof module.src === "string") {
    return module.src;
  }
  throw new Error("Logo: SVG import must be a URL string or { src: string }");
}

type SizeKey = (typeof Size)[keyof typeof Size];

/** Logo mark (`logo.svg`); `lg` = 128px wide */
const logoMarkWidthPx: Record<SizeKey, number> = {
  xs: 32,
  sm: 64,
  md: 96,
  lg: 128,
};

/** `logoWithTitle.svg`; `lg` = 256px wide */
const logoWithTitleWidthPx: Record<SizeKey, number> = {
  xs: 64,
  sm: 128,
  md: 192,
  lg: 256,
};

/** `viewBox` aspect: logo 90×101, logoWithTitle 186×98 */
const LOGO_MARK_ASPECT = 101 / 90;
const LOGO_WITH_TITLE_ASPECT = 98 / 186;

export interface LogoProps {
  size?: SizeKey;
  withTitle?: boolean;
}

export const Logo = ({ size = Size.md, withTitle = false }: LogoProps) => {
  const width = withTitle ? logoWithTitleWidthPx[size] : logoMarkWidthPx[size];
  const aspect = withTitle ? LOGO_WITH_TITLE_ASPECT : LOGO_MARK_ASPECT;
  const height = Math.round(width * aspect);
  const src = svgImportHref(withTitle ? logoWithTitleImport : logoMarkImport);

  return <Image src={src} alt="Logo" width={width} height={height} decoding="async" />;
};
