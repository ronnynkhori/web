import type { Metadata, Viewport } from "next";
import { Kanit, Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";
import designTokens from "../../../docs/design/design-tokens.json";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getNavItems } from "@/components/layout/nav-items";
import { bootScript } from "@/lib/animation/boot-script";
import { MotionPreferenceProvider } from "@/lib/animation/motion-preference";
import { RevealObserver } from "@/lib/animation/reveal-observer";
import { isLocale, locales } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { sitePublic, siteUrl } from "@/lib/site";
import "@/styles/globals.css";

const ogLocale = { pt: "pt_PT", en: "en_GB" } as const;

// Closest Google font to the logo wordmark; [CLIENT TO CONFIRM] against the brand manual.
const kanit = Kanit({
  weight: ["600", "700", "800"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-kanit",
  display: "swap",
  preload: true,
});

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl()),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: { canonical: `/${locale}`, languages: { pt: "/pt", en: "/en", "x-default": "/pt" } },
    robots: sitePublic() ? { index: true, follow: true } : { index: false, follow: false },
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      siteName: dict.meta.title,
      title: dict.meta.title,
      description: dict.meta.description,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
    },
    twitter: { card: "summary_large_image", title: dict.meta.title, description: dict.meta.description },
  };
}

export const viewport: Viewport = {
  themeColor: designTokens.color.brand.navy.value,
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const items = getNavItems(dict, locale);

  return (
    <html
      lang={locale}
      data-theme="light"
      className={`${kanit.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only z-toast focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:bg-action-secondary focus:px-4 focus:py-3 focus:type-label focus:text-on-action-secondary"
        >
          {dict.a11y.skipToContent}
        </a>
        <MotionPreferenceProvider>
          <Header
            locale={locale}
            items={items}
            ctaHref={`/${locale}#games`}
            labels={{
              primaryNav: dict.a11y.primaryNav,
              mobileNav: dict.a11y.mobileNav,
              openMenu: dict.a11y.openMenu,
              closeMenu: dict.a11y.closeMenu,
              language: dict.a11y.language,
              switchTo: dict.a11y.switchTo,
              logo: dict.a11y.logoHome,
              more: dict.nav.more,
              cta: dict.nav.cta,
            }}
          />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer locale={locale} dict={dict} items={items} />
        </MotionPreferenceProvider>
        <RevealObserver />
        <SpeedInsights />
      </body>
    </html>
  );
}
