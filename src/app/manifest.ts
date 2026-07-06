import { typo } from "lib";
import type { MetadataRoute } from "next";

/** Web-манифест: иконки для поисковиков (Яндекс, Google) и добавления на главный экран. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: typo(`Ликос — металлообработка и электрощитовое оборудование`),
    short_name: typo(`Ликос`),
    description:
      typo(`Производство металлоконструкций, электрощитового оборудования, плазменная резка и металлообработка в Екатеринбурге.`),
    start_url: "/",
    display: "browser",
    background_color: "#0b0d10",
    theme_color: "#0b0d10",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
