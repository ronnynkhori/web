import { Suspense, type ReactNode } from "react";
import { io } from "next/cache";
import { notFound } from "next/navigation";
import { Assistant } from "@/components/assistant/assistant";
import { CountriesSection } from "@/components/countries/countries-section";
import { GamesSection } from "@/components/games/games-section";
import { GuideSection } from "@/components/guide/guide-section";
import { Hero } from "@/components/hero/hero";
import { HubSection } from "@/components/hub/hub-section";
import { MascotSection } from "@/components/mascot/mascot-section";
import { PhaseSwitch } from "@/components/layout/phase-switch";
import { QuickBar } from "@/components/layout/quick-bar";
import { SiteBanner } from "@/components/layout/site-banner";
import { getSettings } from "@/lib/cms/read";
import { MediaSection } from "@/components/media/media-section";
import { NewsSection } from "@/components/news/news-section";
import { PromoFilmSection } from "@/components/promo/promo-film-section";
import { SponsorsSection } from "@/components/sponsors/sponsors-section";
import { SportsSection } from "@/components/sports/sports-section";
import { VenuesSection } from "@/components/venues/venues-section";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { DEMO_GAME_DAY, DEMO_PHASE, gameDay, getPhase, isPhase, type Phase } from "@/lib/phase";

type SectionId = "film" | "hub" | "media" | "sports" | "news" | "games" | "mascot" | "countries" | "venues" | "guide" | "sponsors";

/** Phones read top to bottom: what visitors want first comes first in the DOM.
 * Before the Games the order also alternates the navy bands (mascot, countries,
 * live teaser) with light ones. */
const ORDER: Record<Phase, SectionId[]> = {
  pre: ["film", "games", "mascot", "sports", "countries", "venues", "hub", "news", "media", "guide", "sponsors"],
  live: ["hub", "media", "film", "sports", "news", "mascot", "games", "countries", "venues", "guide", "sponsors"],
  post: ["hub", "media", "film", "news", "games", "mascot", "sports", "countries", "venues", "guide", "sponsors"],
};

export default async function HomePage({ params, searchParams }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const shellPhase = DEMO_PHASE ?? "pre";

  // The instant shell is just the hero (a full-page fallback would send every
  // section twice); the spacer keeps the footer off-screen until sections stream in.
  return (
    <Suspense
      fallback={
        <>
          <Hero dict={dict} locale={locale} phase={shellPhase} day={DEMO_GAME_DAY} />
          <div aria-hidden="true" className="min-h-svh" />
        </>
      }
    >
      <PhaseFromUrl searchParams={searchParams} dict={dict} locale={locale} />
    </Suspense>
  );
}

async function PhaseFromUrl({
  searchParams,
  dict,
  locale,
}: {
  searchParams: PageProps<"/[locale]">["searchParams"];
  dict: Dictionary;
  locale: Locale;
}) {
  const { phase: requested, preview } = await searchParams;
  const settings = await getSettings();
  const fixed = settings.phase === "auto" ? null : settings.phase;
  await io();
  const now = new Date();
  const phase = isPhase(requested) ? requested : (fixed ?? getPhase(now));
  const day = fixed ? DEMO_GAME_DAY : gameDay(now).day;
  // Visitors never see the switcher; staff open /en?preview (or any ?phase= link) to demo it.
  const showSwitch = isPhase(requested) || preview !== undefined;
  return <PhasedHome phase={phase} day={day} dict={dict} locale={locale} preview={showSwitch} />;
}

function PhasedHome({
  phase,
  day,
  dict,
  locale,
  preview,
}: {
  phase: Phase;
  day: number;
  dict: Dictionary;
  locale: Locale;
  preview?: boolean;
}) {
  const compact = phase !== "pre";
  const sections: Record<SectionId, ReactNode> = {
    film: <PromoFilmSection key="film" dict={dict} />,
    hub: <HubSection key="hub" dict={dict} locale={locale} phase={phase} />,
    media: <MediaSection key="media" dict={dict} locale={locale} />,
    sports: <SportsSection key="sports" dict={dict} locale={locale} />,
    news: <NewsSection key="news" dict={dict} locale={locale} />,
    games: <GamesSection key="games" dict={dict} locale={locale} compact={compact} />,
    mascot: <MascotSection key="mascot" dict={dict} locale={locale} />,
    countries: <CountriesSection key="countries" dict={dict} locale={locale} compact={compact} />,
    venues: <VenuesSection key="venues" dict={dict} locale={locale} />,
    guide: <GuideSection key="guide" dict={dict} locale={locale} />,
    sponsors: <SponsorsSection key="sponsors" dict={dict} locale={locale} />,
  };

  return (
    <>
      <SiteBanner locale={locale} closeLabel={dict.a11y.dismissAlert} />
      <Hero dict={dict} locale={locale} phase={phase} day={day} />
      {ORDER[phase].map((id) => sections[id])}
      <QuickBar phase={phase} labels={dict.quickBar} />
      <Assistant dict={dict} locale={locale} />
      {preview && <PhaseSwitch phase={phase} labels={dict.phase} />}
    </>
  );
}
