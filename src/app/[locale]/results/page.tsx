import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LiveHub } from "@/components/hub/hub-section";
import { PageHeader } from "@/components/layout/page-header";
import { pageBanners } from "@/data/page-banners";
import { PreGamesNote } from "@/components/layout/pre-games-note";
import { CompetitionGrid } from "@/components/schedule/competition-grid";
import { KeyDates } from "@/components/schedule/key-dates";
import { Skeleton } from "@/components/ui/skeleton";
import { SubsectionTitle } from "@/components/ui/subsection-title";
import { currentPhase } from "@/lib/current-phase";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/page-metadata";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return pageMetadata(locale, "/results", dict.pages.resultsTitle, dict.meta.title, dict.pages.resultsIntro);
}

export default async function ResultsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const p = dict.pages;
  return (
    <>
      <PageHeader
        id="results-title"
        overline={dict.hub.overline}
        meta={<span className="text-fg-2">{dict.hero.dates}</span>}
        image={pageBanners.results}
        title={p.resultsTitle}
        intro={<p className="m-0">{p.resultsIntro}</p>}
        breadcrumbLabel={p.breadcrumb}
        crumbs={[
          { href: `/${locale}`, label: p.home },
          { href: `/${locale}/results`, label: p.resultsTitle },
        ]}
      />
      <Suspense fallback={<Skeleton className="h-[24rem] w-full" />}>
        <ResultsBody searchParams={searchParams} dict={dict} locale={locale} />
      </Suspense>
    </>
  );
}

async function ResultsBody({ searchParams, dict, locale }: { searchParams: Props["searchParams"]; dict: Dictionary; locale: Locale }) {
  const phase = await currentPhase((await searchParams).phase);
  if (phase === "pre") {
    const p = dict.pages;
    const g = dict.guide;
    return (
      <>
        <section aria-labelledby="results-title" data-theme="dark" className="bg-surface py-8 text-fg">
          <div className="container-page">
            <PreGamesNote title={dict.hub.preTitle} body={dict.hub.preBody} cta={{ href: `/${locale}/schedule`, label: p.fullSchedule }} />
          </div>
        </section>
        <div className="container-page flex flex-col gap-9 py-9">
          <section aria-labelledby="key-dates-title" className="flex flex-col gap-4">
            <SubsectionTitle id="key-dates-title">{p.keyDates}</SubsectionTitle>
            <KeyDates labels={g} locale={locale} />
          </section>
          <section aria-labelledby="glance-title" className="flex flex-col gap-4">
            <SubsectionTitle id="glance-title">{p.glance}</SubsectionTitle>
            <p className="m-0 max-w-prose type-body-m text-fg-2">{p.glanceIntro}</p>
            <CompetitionGrid dict={dict} locale={locale} />
          </section>
        </div>
      </>
    );
  }
  return (
    <section aria-labelledby="results-title" data-theme="dark" className="bg-surface py-8 text-fg">
      <div className="container-page">
        <LiveHub dict={dict} locale={locale} phase={phase} initialTab="results" />
      </div>
    </section>
  );
}
