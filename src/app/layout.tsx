import "~/components/globals.css";

import { type Metadata } from "next";
import { Geist_Mono, Golos_Text, Unbounded } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { AdaptiveProvider, Toaster, TooltipProvider, UserProvider } from "~/components";
import { websiteConstants } from "~/consts";
import { TRPCReactProvider } from "~/trpc/react";

import { Footer } from "./_lib/components/Footer";
import { SiteMenu } from "./_lib/components/SiteMenu";
import { YANDEX_METRIKA_COUNTER_ID, YANDEX_METRIKA_INIT_SCRIPT } from "./_lib/lib/yandexMetrika";
import { SiteSettingsProvider } from "./_lib/model/SiteSettingsProvider";

export const metadata: Metadata = {
  title: websiteConstants.METADATA_TITLE,
  description: websiteConstants.METADATA_DESCRIPTION,
  icons: {
    // Порядок важен: ico первым — фолбэк для Safari и поисковиков, SVG подхватят Chrome/Firefox по теме.
    // Именование файлов — по теме, для которой иконка: favicon-dark.svg = белая монограмма ДЛЯ тёмной темы.
    // icon-192.png здесь не указываем: у него сплошной тёмный фон (для manifest/Android), во вкладке он выглядит чёрным квадратом.
    // ?v=2 сбрасывает кэш фавиконок у браузеров, успевших закэшировать старую иконку T3
    icon: [
      { url: "/favicon.ico?v=2", sizes: "48x48 32x32 16x16" },
      { url: "/favicon-light.svg?v=2", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.svg?v=2", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/apple-touch-icon.png",
  },
};

const golos = Golos_Text({
  subsets: ["latin", "cyrillic"],
  variable: "--font-golos",
  weight: ["400", "500", "600"],
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  weight: ["600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${golos.variable} ${unbounded.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: YANDEX_METRIKA_INIT_SCRIPT }} />
      </head>
      <body className="dark">
        <noscript>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element -- пиксель Метрики для браузеров без JS */}
            <img
              src={`https://mc.yandex.ru/watch/${YANDEX_METRIKA_COUNTER_ID}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        <TRPCReactProvider>
          <SiteSettingsProvider>
            <NuqsAdapter>
              <AdaptiveProvider>
                <UserProvider>
                  <TooltipProvider>
                    <SiteMenu />
                    {children}
                    <Footer />
                    <Toaster />
                  </TooltipProvider>
                </UserProvider>
              </AdaptiveProvider>
            </NuqsAdapter>
          </SiteSettingsProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
