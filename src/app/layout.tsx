import "~/components/globals.css";

import { type Metadata } from "next";
import { Geist_Mono, Golos_Text, Unbounded } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { AdaptiveProvider, Toaster, TooltipProvider, UserProvider, ZodLocaleInit } from "~/components";
import { websiteConstants } from "~/consts";
import { TRPCReactProvider } from "~/trpc/react";

import { Footer } from "./_lib/components/Footer";
import { JsonLd } from "./_lib/components/JsonLd";
import { SiteMenu } from "./_lib/components/SiteMenu";
import { getSiteBaseUrl } from "./_lib/lib/siteUrl";
import { YANDEX_METRIKA_COUNTER_ID, YANDEX_METRIKA_INIT_SCRIPT } from "./_lib/lib/yandexMetrika";
import { SiteSettingsProvider } from "./_lib/model/SiteSettingsProvider";

const baseUrl = getSiteBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: websiteConstants.METADATA_TITLE,
    // Дочерние страницы задают короткий title — бренд добавляется автоматически
    template: websiteConstants.BRAND_TITLE_SUFFIX,
  },
  description: websiteConstants.METADATA_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: websiteConstants.COMPANY_NAME,
    url: "/",
    title: websiteConstants.METADATA_TITLE,
    description: websiteConstants.METADATA_DESCRIPTION,
  },
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
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: websiteConstants.COMPANY_NAME,
            url: baseUrl,
            logo: `${baseUrl}/icon-512.png`,
            telephone: `+${websiteConstants.PHONE_DIGITS}`,
            email: websiteConstants.EMAIL,
            address: {
              "@type": "PostalAddress",
              addressCountry: "RU",
              addressLocality: websiteConstants.ADDRESS_LOCALITY,
              streetAddress: websiteConstants.ADDRESS_STREET,
            },
          }}
        />
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
        <ZodLocaleInit />
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
