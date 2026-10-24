import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getSport, sports } from "@/data/sports";
import type { Sport, SportProgramme } from "@/data/types";
import { getVenue } from "@/data/venues";
import { LiveHub } from "@/components/hub/hub-section";
import { PageHeader } from "@/components/layout/page-header";
import { PreGamesNote } from "@/components/layout/pre-games-note";
import { ScheduleDays } from "@/components/schedule/schedule-days";
import { Icon } from "@/components/ui/icon";
import { MediaFrame } from "@/components/ui/media-frame";
import { Skeleton } from "@/components/ui/skeleton";
import { SubsectionTitle } from "@/components/ui/subsection-title";
import { getSchedule, getVenues } from "@/lib/cms/read";
import { currentPhase } from "@/lib/current-phase";
import { fill, isLocale, pick, type Locale } from "@/lib/i18n/config";
import { getDictionary, type Dictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/page-metadata";

type Props = {
  params: Promise<{ locale: string; sport: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return sports.map((s) => ({ sport: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, sport: id } = await params;
  const sport = getSport(id);
  if (!isLocale(locale) || !sport) return {};
  const dict = await getDictionary(locale);
  return pageMetadata(locale, `/sports/${sport.id}`, pick(sport.name, locale), dict.meta.title);
}

export default async function SportPage({ params, searchParams }: Props) {
  const { locale, sport: id } = await params;
  const sport = getSport(id);
  if (!isLocale(locale) || !sport) notFound();
  const [dict, allSessions, venueDocs] = await Promise.all([getDictionary(locale), getSchedule(), getVenues()]);
  const p = dict.pages;
  const name = pick(sport.name, locale);
  const schedule = allSessions.filter((s) => s.sportId === sport.id);
  const programme = sport.programme;
  const programmeVenues = (programme?.venues ?? [])
    .map((id) => venueDocs.find((v) => v.id === id) ?? getVenue(id))
    .filter((v) => v !== undefined)
    .map((v) => pick(v.name, locale));
  const venues = [...new Set([...schedule.map((s) => pick(s.venue, locale)).filter(Boolean), ...programmeVenues])];
  const hasSchedule = Boolean(programme) || schedule.length > 0;

  return (
    <>
      <PageHeader
        id="sport-title"
        overline={dict.sports.categories[sport.category]}
        title={name}
        breadcrumbLabel={p.breadcrumb}
        crumbs={[
          { href: `/${locale}`, label: p.home },
          { href: `/${locale}/sports`, label: dict.sports.title },
          { href: `/${locale}/sports/${sport.id}`, label: name },
        ]}
      >
        <div className="relative">
          <MediaFrame
            ratio="3/2"
            image={sport.image}
            alt={sport.image ? pick(sport.image.alt, locale) : ""}
            tone={sport.tone}
            placeholderLabel={dict.sports.photoRequired}
            priority
            sizes="(min-width: 64rem) 40vw, 100vw"
            className="rounded-sm"
          />
          {sport.mascot && (
            <Image
              src={sport.mascot.src}
              alt={fill(dict.mascot.poseAlt, { sport: name })}
              width={sport.mascot.width}
              height={sport.mascot.height}
              sizes="(min-width: 64rem) 16rem, 40vw"
              className="hero-mascot absolute -right-2 -bottom-4 h-[85%] w-auto drop-shadow-[0_16px_28px_rgb(0_0_0/0.5)]"
            />
          )}
        </div>
      </PageHeader>

      <div className="container-page flex flex-col gap-9 py-9">
        {(hasSchedule || venues.length > 0) && (
          <div className="grid gap-7 desktop:grid-cols-12">
            {hasSchedule && (
              <section aria-labelledby="sport-schedule-title" className={venues.length > 0 ? "flex flex-col gap-4 desktop:col-span-8" : "flex flex-col gap-4 desktop:col-span-12"}>
                <SubsectionTitle id="sport-schedule-title">{p.sportSchedule}</SubsectionTitle>
                {programme && <CompetitionDays programme={programme} locale={locale} p={p} />}
                {schedule.length > 0 && <ScheduleDays schedule={schedule} locale={locale} addLabel={dict.hub.addToCalendar} addDayLabel={p.addDay} />}
              </section>
            )}

            {venues.length > 0 && (
              <section aria-labelledby="sport-venues-title" className={hasSchedule ? "flex flex-col gap-4 desktop:col-span-4" : "flex flex-col gap-4 desktop:col-span-12"}>
                <SubsectionTitle id="sport-venues-title">{p.sportVenues}</SubsectionTitle>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {venues.map((v) => (
                    <li key={v} className="flex items-center gap-2 type-label">
                      <Icon name="pin" size={16} className="text-accent" />
                      {v}
                    </li>
                  ))}
                </ul>
                <Link href={`/${locale}#venues`} className="inline-flex min-h-touch items-center gap-2 type-label text-link underline-offset-4 hover:underline">
                  {dict.venues.title}
                  <Icon name="arrow-right" size={16} />
                </Link>
              </section>
            )}
          </div>
        )}
        {programme && (programme.eligibility || programme.quota || programme.broadcast || programme.note) && (
          <EntryRules programme={programme} locale={locale} p={p} />
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-[16rem] w-full" />}>
        <SportLive searchParams={searchParams} dict={dict} locale={locale} sport={sport} name={name} />
      </Suspense>

      <nav aria-labelledby="other-sports-title" className="container-page flex flex-col gap-4 py-9">
        <h2 id="other-sports-title" className="m-0 type-heading-m">
          {p.otherSports}
        </h2>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {sports
            .filter((s) => s.id !== sport.id)
            .map((s) => (
              <li key={s.id}>
                <Link
                  href={`/${locale}/sports/${s.id}`}
                  className="inline-flex min-h-touch items-center rounded-pill border border-line px-4 type-label hover:border-line-strong hover:bg-surface-2"
                >
                  {pick(s.name, locale)}
                </Link>
              </li>
            ))}
        </ul>
      </nav>
    </>
  );
}

type Pages = Dictionary["pages"];

function CompetitionDays({ programme, locale, p }: { programme: SportProgramme; locale: Locale; p: Pages }) {
  const days = [...programme.days.map((iso) => ({ iso, rest: false })), ...(programme.rest ?? []).map((iso) => ({ iso, rest: true }))].sort(
    (a, b) => a.iso.localeCompare(b.iso),
  );
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const month = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  return (
    <div className="flex flex-col gap-3">
      <h3 className="m-0 type-label text-fg-2">{p.sportDays}</h3>
      <ol className="m-0 flex list-none flex-wrap gap-2 p-0">
        {days.map(({ iso, rest }) => (
          <li
            key={iso}
            className={
              rest
                ? "flex min-w-[4.5rem] flex-col items-center rounded-sm border border-dashed border-line-strong px-3 py-2 text-fg-muted"
                : "flex min-w-[4.5rem] flex-col items-center rounded-sm border border-line bg-surface-2 px-3 py-2"
            }
          >
            <span className="type-caption uppercase">{weekday.format(new Date(iso))}</span>
            <time dateTime={iso} className="type-heading-m tabular">
              {Number(iso.slice(8))}
            </time>
            <span className="type-caption">{rest ? p.sportRestDay : month.format(new Date(iso))}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function EntryRules({ programme, locale, p }: { programme: SportProgramme; locale: Locale; p: Pages }) {
  const q = programme.quota;
  const quota = q && [
    q.men > 0 && fill(p.quotaMen, { n: q.men }),
    q.women > 0 && fill(p.quotaWomen, { n: q.women }),
    q.staff > 0 && fill(p.quotaStaff, { n: q.staff }),
    q.judges > 0 && fill(p.quotaJudges, { n: q.judges }),
  ].filter((x): x is string => Boolean(x));
  return (
    <section aria-labelledby="sport-rules-title" className="flex flex-col gap-4">
      <SubsectionTitle id="sport-rules-title">{p.sportFacts}</SubsectionTitle>
      <dl className="m-0 grid gap-4 tablet:grid-cols-3">
        {programme.eligibility && (
          <div className="flex flex-col gap-2 rounded-sm border border-line bg-surface-2 p-5">
            <dt className="type-overline text-accent">{p.eligibility}</dt>
            <dd className="m-0 flex flex-col gap-2 type-body-m">
              {pick(programme.eligibility, locale)}
              <span className="type-body-s text-fg-2">{p.ageProof}</span>
            </dd>
          </div>
        )}
        {q && quota && (
          <div className="flex flex-col gap-2 rounded-sm border border-line bg-surface-2 p-5">
            <dt className="type-overline text-accent">{p.quota}</dt>
            <dd className="m-0 flex flex-col gap-2">
              <span className="type-heading-m">{fill(p.quotaTotal, { n: q.total })}</span>
              <ul className="m-0 flex list-none flex-col gap-1 p-0 type-body-s text-fg-2">
                {quota.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {programme.broadcast && (
          <div className="flex flex-col gap-2 rounded-sm border border-line bg-surface-2 p-5">
            <dt className="type-overline text-accent">{p.broadcast}</dt>
            <dd className="m-0 type-body-m">{p.broadcastModes[programme.broadcast]}</dd>
          </div>
        )}
      </dl>
      {programme.note && <p className="m-0 max-w-prose type-body-m text-fg-2">{pick(programme.note, locale)}</p>}
      <p className="m-0 type-caption text-fg-muted">{p.manualSource}</p>
    </section>
  );
}

async function SportLive({
  searchParams,
  dict,
  locale,
  sport,
  name,
}: {
  searchParams: Props["searchParams"];
  dict: Dictionary;
  locale: Locale;
  sport: Sport;
  name: string;
}) {
  const phase = await currentPhase((await searchParams).phase);
  // Before the Games there is only a note, so it gets a slim light strip instead of a full red band.
  if (phase === "pre") {
    return (
      <section aria-labelledby="sport-live-title" className="border-y border-line bg-surface-2 py-7 text-fg">
        <div className="container-page flex flex-col gap-5">
          <SubsectionTitle id="sport-live-title">{dict.pages.sportLive}</SubsectionTitle>
          <PreGamesNote as="h3" title={dict.hub.preTitle} body={fill(dict.pages.sportPreLive, { sport: name })} />
        </div>
      </section>
    );
  }
  return (
    <section aria-labelledby="sport-live-title" data-theme="dark" className="bg-surface py-9 text-fg">
      <div className="container-page flex flex-col gap-5">
        <SubsectionTitle id="sport-live-title">{dict.pages.sportLive}</SubsectionTitle>
        <LiveHub dict={dict} locale={locale} phase={phase} initialSport={sport.id} hideFollow />
      </div>
    </section>
  );
}
