import { Suspense, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { countries } from "@/data/countries";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator, type Translate } from "@/lib/admin/i18n/translate";
import { pick, type Locale } from "@/lib/i18n/config";
import { AdminI18nProvider, AdminLanguageSwitch } from "./i18n";

const sportTiles = [
  { src: "/images/mascot/atletismo-1.png", alt: "" },
  { src: "/images/mascot/futebol-1.png", alt: "" },
  { src: "/images/mascot/basquetebol-3x3-2-08.png", alt: "" },
];

/** The emblem colours (red, blue, yellow) as a thin stripe. */
function BrandStripe({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex h-1.5 ${className ?? ""}`}>
      <span className="flex-1 bg-[var(--tk-color-brand-red)]" />
      <span className="flex-1 bg-[var(--tk-color-brand-blue)]" />
      <span className="flex-1 bg-[var(--tk-color-brand-yellow)]" />
    </div>
  );
}

function BrandPanel({ t, locale }: { t: Translate; locale: Locale }) {
  return (
    <section aria-label="XIII Jogos Desportivos da CPLP" className="surface-black relative isolate flex min-h-72 flex-col overflow-hidden bg-sidebar text-sidebar-foreground sm:min-h-80 lg:min-h-svh">
      <Image
        src="/images/demo/hero-main.jpg"
        alt={t("A sprinter in a green kit drives out of the starting blocks under stadium lights at dusk")}
        fill
        preload
        quality={90}
        sizes="(min-width: 1024px) 178vh, 100vw"
        className="-z-20 object-cover object-[72%_50%]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-sidebar via-sidebar/70 to-sidebar/20 lg:bg-gradient-to-tr lg:via-sidebar/55 lg:to-transparent" />
      <BrandStripe className="relative" />

      <div className="flex flex-1 flex-col justify-between gap-8 p-6 sm:p-8 lg:p-12">
        <div className="flex items-center gap-3">
          <span className="grid size-14 shrink-0 place-items-center rounded-md bg-white p-1.5 shadow-lg lg:size-16">
            <Image src="/images/brand/cplp-emblem.png" alt="" width={512} height={512} className="h-full w-auto" sizes="64px" />
          </span>
          <div className="flex flex-col">
            <span className="font-display text-sm tracking-[0.2em] text-highlight">{t("XIII CPLP Games")}</span>
            <span className="text-sm font-semibold text-white/85">{t("Angola 2027")}</span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="font-display text-base tracking-[0.18em] text-highlight sm:text-lg">{t("13th edition · July 2027")}</p>
            <p className="font-display text-5xl leading-[0.9] tracking-wide text-white drop-shadow-lg sm:text-6xl lg:text-8xl">CPLP 2027</p>
            <p className="hidden max-w-md text-base text-white/85 sm:block">{t("Nine nations, one community. Every score, result and story on the official website is published from here.")}</p>
          </div>

          <ul aria-label={t("The 9 nations")} className="flex flex-wrap gap-1.5">
            {countries.map((c) => (
              <li key={c.code}>
                <Image src={`/images/flags/${c.code.toLowerCase()}.svg`} alt={pick(c.name, locale)} title={pick(c.name, locale)} width={32} height={24} className="h-5 w-auto rounded-[3px] shadow ring-1 ring-white/30 sm:h-6" />
              </li>
            ))}
          </ul>

          <ul aria-hidden="true" className="hidden grid-cols-3 gap-3 lg:grid lg:max-w-lg">
            {sportTiles.map((t) => (
              <li key={t.src} className="relative aspect-[4/3] overflow-hidden rounded-md bg-white/10 ring-1 ring-white/25 shadow-lg">
                <Image src={t.src} alt="" fill sizes="12rem" className="object-contain p-1" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

interface AuthShellProps {
  /** English; translated here. */
  title: string;
  description: string;
  children: ReactNode;
}

/** Signed-out frame shared by sign-in and password reset, in the visitor's Control Room language. */
export function AuthShell(props: AuthShellProps) {
  return (
    <Suspense fallback={<main className="min-h-svh bg-sidebar lg:bg-background" />}>
      <LocalizedAuthShell {...props} />
    </Suspense>
  );
}

async function LocalizedAuthShell({ title, description, children }: AuthShellProps) {
  const locale = await getAdminLocale();
  const t = translator(locale);
  return (
    <AdminI18nProvider locale={locale}>
      <main lang={locale} className="min-h-svh bg-background lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <BrandPanel t={t} locale={locale} />
        <section className="flex flex-col px-5 py-10 sm:px-8 lg:min-h-svh lg:px-14">
          <div className="mx-auto flex w-full max-w-sm justify-end">
            <AdminLanguageSwitch />
          </div>
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-7 pt-6">
            <div className="flex flex-col gap-3">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-sm bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                {t("Staff only")}
              </span>
              <h1 className="font-display text-4xl leading-none tracking-wide">{t(title)}</h1>
              <p className="text-sm text-muted-foreground">{t(description)}</p>
            </div>
            <div className="flex flex-col gap-5">{children}</div>
          </div>
          <div className="mx-auto mt-10 flex w-full max-w-sm items-center justify-between gap-4 border-t pt-5 text-xs text-muted-foreground">
            <span>{t("Games Control Room")}</span>
            <Link href={`/${locale}`} className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline">
              {t("Official website")}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
    </AdminI18nProvider>
  );
}
