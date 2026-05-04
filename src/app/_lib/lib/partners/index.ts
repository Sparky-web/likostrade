import { typo } from "lib";
import type { StaticImageData } from "next/image";

import afinaLogo from "./афина.png";
import brusnikaLogo from "./брусника.png";
import ggokLogo from "./ггок.png";
import dinamikaLogo from "./динамика.png";
import ezfmLogo from "./езфм.png";
import zooLogo from "./зоопарк.png";
import profitenergoLogo from "./профитэнерго.png";
import stalkraftLogo from "./сталькрафт.png";

export type PartnerLogo = {
  src: StaticImageData;
  alt: string;
};

/** Логотипы партнёров для сетки в блоке «Наши клиенты и партнёры». */
export const PARTNER_LOGOS: PartnerLogo[] = [
  { src: stalkraftLogo, alt: typo("Сталькрафт") },
  { src: dinamikaLogo, alt: typo("Динамика") },
  { src: profitenergoLogo, alt: typo("Профитэнерго") },
  { src: ggokLogo, alt: typo("ГГОК") },
  { src: ezfmLogo, alt: typo("ЕЗФМ") },
  { src: afinaLogo, alt: typo("Афина") },
  { src: zooLogo, alt: typo("Зоопарк") },
  { src: brusnikaLogo, alt: typo("Брусника") },
];
