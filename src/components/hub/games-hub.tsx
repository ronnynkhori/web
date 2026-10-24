"use client";

import { LayoutGroup, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ImageAsset } from "@/data/types";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { fill, pick, type Locale } from "@/lib/i18n/config";
import { useLiveSnapshot, type ChangeSet } from "@/lib/live/use-live-snapshot";
import type { LiveSnapshot, Match, MedalRow, ResultRow } from "@/lib/live/types";
import type { Phase } from "@/lib/phase";
import { cn } from "@/lib/cn";
import { Badge, DemoBadge } from "@/components/ui/badge";
import { AddToCalendar } from "@/components/ui/add-to-calendar";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Flag } from "@/components/ui/flag";
import { Icon } from "@/components/ui/icon";

type Tab = "live" | "results" | "medals";
const TABS: Tab[] = ["live", "results", "medals"];
const FOLLOW_KEY = "m26-follow";
const FOLLOW_EVENT = "m26-follow-change";

function readFollow(): string | null {
  return localStorage.getItem(FOLLOW_KEY);
}

function writeFollow(code: string | null) {
  if (code) localStorage.setItem(FOLLOW_KEY, code);
  else localStorage.removeItem(FOLLOW_KEY);
  window.dispatchEvent(new Event(FOLLOW_EVENT));
}

function subscribeFollow(onChange: () => void) {
  window.addEventListener(FOLLOW_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(FOLLOW_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export interface HubLabels {
  hub: Dictionary["hub"];
  live: Dictionary["live"];
  results: Dictionary["results"];
  status: Dictionary["status"];
}

export interface GamesHubProps {
  initial: LiveSnapshot;
  phase: Phase;
  locale: Locale;
  /** Participating nations (follow picker). */
  nations: Array<{ code: string; name: string; flag?: ImageAsset }>;
  /** Flags for every nation that can appear in scores and results. */
  allFlags: Array<{ code: string; name: string; flag?: ImageAsset }>;
  sports: Array<{ id: string; name: string }>;
  labels: HubLabels;
  /** Tab shown first on phones (a #live/#results/#medals hash still wins). */
  initialTab?: Tab;
  /** Pre-select a sport filter, e.g. on a sport page. */
  initialSport?: string;
  /** Hide the "follow your country" picker where the page already has a focus. */
  hideFollow?: boolean;
}

/**
 * The phone-first live centre. Phones: one tab at a time (Live / Results /
 * Medals) with a sliding indicator, up to large screens; large: three columns
 * side by side (three columns at 1024px are too cramped to scan).
 * Data polls through useLiveSnapshot (demo provider until the feed is chosen).
 */
export function GamesHub({ initial, phase, locale, nations, allFlags, sports, labels, initialTab, initialSport, hideFollow }: GamesHubProps) {
  const { snapshot, changed, error } = useLiveSnapshot(initial);
  const [tab, setTab] = useState<Tab>(initialTab ?? (phase === "post" ? "medals" : "live"));
  const [sport, setSport] = useState<string | null>(initialSport ?? null);
  const activeSports = sports.filter(
    (s) => snapshot.matches.some((m) => m.sportId === s.id) || snapshot.results.some((r) => r.sportId === s.id),
  );
  const matches = sport ? snapshot.matches.filter((m) => m.sportId === sport) : snapshot.matches;
  const results = sport ? snapshot.results.filter((r) => r.sportId === sport) : snapshot.results;
  const sportName = sports.find((s) => s.id === sport)?.name ?? "";
  const empty = <EmptyState icon="calendar" text={fill(labels.hub.noneForSport, { sport: sportName })} />;
  const follow = useSyncExternalStore(subscribeFollow, readFollow, () => null);
  const root = useRef<HTMLDivElement>(null);
  const flags = useMemo(() => new Map([...allFlags, ...nations].map((n) => [n.code, n])), [allFlags, nations]);

  useEffect(() => {
    const fromHash = () => {
      const h = location.hash.slice(1);
      const target: Tab | null = h === "results" ? "results" : h === "medals" ? "medals" : h === "live" ? "live" : null;
      if (!target) return;
      setTab(target);
      requestAnimationFrame(() => root.current?.scrollIntoView({ block: "start" }));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const scored = snapshot.matches.find((x) => changed.has(`match:${x.id}:home`) || changed.has(`match:${x.id}:away`));
  const announce = scored
    ? fill(labels.hub.scoreUpdate, {
        sport: pick(scored.sport, locale),
        home: pick(scored.home.name, locale),
        homeScore: scored.home.score,
        away: pick(scored.away.name, locale),
        awayScore: scored.away.score,
      })
    : "";

  const panelClass = (t: Tab) => cn("min-w-0", tab !== t && "max-large:hidden");

  return (
    <div ref={root} className="scroll-mt-(--header-h)">
      {!hideFollow && <FollowPicker nations={nations} follow={follow} onChoose={writeFollow} labels={labels.hub} />}
      <ScoresTicker matches={matches} locale={locale} labels={labels} />

      <LayoutGroup id="hub-tabs">
        <div
          role="tablist"
          aria-label={labels.hub.tabsLabel}
          className="sticky top-(--sticky-top) z-raised mx-[calc(-1*var(--page-margin))] mb-5 grid grid-cols-3 border-b border-line bg-surface px-(--page-margin) shadow-sm transition-[top] duration-ui ease-standard tablet:mb-6 large:hidden"
        >
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              id={`hub-tab-${t}`}
              aria-selected={tab === t}
              aria-controls={t === "live" ? "hub-panel-live" : t}
              tabIndex={tab === t ? 0 : -1}
              onClick={() => setTab(t)}
              onKeyDown={(e) => {
                const i = TABS.indexOf(t);
                const to =
                  e.key === "ArrowRight" ? TABS[(i + 1) % TABS.length]
                  : e.key === "ArrowLeft" ? TABS[(i - 1 + TABS.length) % TABS.length]
                  : e.key === "Home" ? TABS[0]
                  : e.key === "End" ? TABS[TABS.length - 1]
                  : null;
                if (!to) return;
                e.preventDefault();
                setTab(to);
                document.getElementById(`hub-tab-${to}`)?.focus();
              }}
              className={cn(
                "relative min-h-touch-lg type-label transition-colors duration-ui ease-standard",
                tab === t ? "text-fg" : "text-fg-muted",
              )}
            >
              {labels.hub.tabs[t]}
              {tab === t && (
                <motion.span layoutId="hub-tab-indicator" className="absolute inset-x-3 bottom-0 h-[3px] bg-accent" />
              )}
            </button>
          ))}
        </div>
      </LayoutGroup>

      <SportFilter sports={activeSports} value={sport} onChange={setSport} labels={labels.hub} />
      <FeedStatus snapshot={snapshot} error={error} locale={locale} labels={labels.live} />

      <div className="grid gap-7 large:grid-cols-[1.15fr_1fr_1fr] large:gap-8">
        <section id="hub-panel-live" role="tabpanel" aria-labelledby="hub-tab-live" className={panelClass("live")}>
          <PanelTitle>{labels.hub.liveNow}</PanelTitle>
          {matches.length ? (
            <LiveList matches={matches} changed={changed} follow={follow} flags={flags} locale={locale} labels={labels} />
          ) : (
            empty
          )}
        </section>
        <section id="results" role="tabpanel" aria-labelledby="hub-tab-results" className={cn(panelClass("results"), "scroll-mt-(--header-h)")}>
          <PanelTitle>{labels.results.latest}</PanelTitle>
          {results.length ? <ResultsList results={results} follow={follow} flags={flags} locale={locale} labels={labels} /> : empty}
        </section>
        <section id="medals" role="tabpanel" aria-labelledby="hub-tab-medals" className={cn(panelClass("medals"), "scroll-mt-(--header-h)")}>
          <PanelTitle>{labels.results.title}</PanelTitle>
          <MedalTable
            rows={snapshot.medals}
            changed={changed}
            follow={follow}
            flags={flags}
            locale={locale}
            labels={labels}
            full={initialTab === "results"}
          />
        </section>
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  );
}

function ScoresTicker({ matches, locale, labels }: { matches: Match[]; locale: Locale; labels: HubLabels }) {
  const [paused, setPaused] = useState(false);
  const items = matches
    .filter((m) => m.status === "live" || m.status === "finished")
    .sort((a, b) => Number(b.status === "live") - Number(a.status === "live"));
  // A ticker of one or two scores just repeats the cards beneath it.
  if (items.length < 3) return null;

  const list = (copy: boolean) => (
    <ul
      aria-hidden={copy || undefined}
      data-marquee-copy={copy || undefined}
      className="m-0 flex shrink-0 list-none items-center gap-6 p-0 pr-6"
    >
      {items.map((m) => (
        <li key={m.id} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap type-caption">
          {m.status === "live" ? (
            <span aria-hidden="true" className="live-dot size-2 rounded-pill bg-live" />
          ) : (
            <span aria-hidden="true" className="size-2 rounded-pill bg-line" />
          )}
          <span className="text-fg-muted">{pick(m.sport, locale)}</span>
          <span className="font-semibold text-fg tabular">
            {m.home.countryCode} {m.home.score}–{m.away.score} {m.away.countryCode}
          </span>
          <span className="sr-only">({m.status === "live" ? labels.status.live : labels.live.fullTime})</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label={labels.live.ticker}
      data-paused={paused}
      className="marquee mb-5 flex items-stretch overflow-hidden rounded-sm border border-line bg-surface-2"
    >
      <p className="m-0 flex shrink-0 items-center border-r border-line px-3 type-label text-fg">{labels.live.ticker}</p>
      <div className="marquee-viewport min-w-0 flex-1 overflow-hidden py-2 pl-4">
        <div className="marquee-track" style={{ animationDuration: `${Math.max(24, items.length * 7)}s` }}>
          {list(false)}
          {list(true)}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? labels.live.playTicker : labels.live.pauseTicker}
        className="marquee-control flex min-h-touch min-w-touch shrink-0 items-center justify-center border-l border-line text-fg-2 hover:text-fg"
      >
        <span aria-hidden="true" className="type-label">
          {paused ? "▶" : "❚❚"}
        </span>
      </button>
    </section>
  );
}

function SportFilter({
  sports,
  value,
  onChange,
  labels,
}: {
  sports: GamesHubProps["sports"];
  value: string | null;
  onChange: (id: string | null) => void;
  labels: Dictionary["hub"];
}) {
  const options = [{ id: null, name: labels.allSports }, ...sports];
  return (
    <LayoutGroup id="hub-sport">
      <div
        role="group"
        aria-label={labels.sportFilter}
        className="mx-[calc(-1*var(--page-margin))] mb-5 flex gap-2 overflow-x-auto px-(--page-margin) py-1 [scrollbar-width:none] desktop:mx-0 desktop:mb-6 desktop:flex-wrap desktop:px-0"
      >
        {options.map((s) => {
          const active = value === s.id;
          return (
            <button
              key={s.id ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(s.id)}
              className={cn(
                "relative isolate inline-flex min-h-touch shrink-0 items-center rounded-pill border px-4 type-caption font-semibold whitespace-nowrap transition-colors duration-ui ease-standard",
                active ? "border-transparent text-on-action-secondary" : "border-line text-fg-2 hover:text-fg",
              )}
            >
              {active && (
                <motion.span layoutId="hub-sport-pill" className="absolute inset-0 -z-10 rounded-pill bg-action-secondary" />
              )}
              {s.name}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

/** Games time, so server and browser render the same clock. */
function updatedTime(iso: string, locale: Locale) {
  return `${new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Luanda" }).format(new Date(iso))} WAT`;
}

/** Demo label, data freshness and connection state, above every live panel (content-rules §9). */
function FeedStatus({
  snapshot,
  error,
  locale,
  labels,
}: {
  snapshot: LiveSnapshot;
  error: boolean;
  locale: Locale;
  labels: Dictionary["live"];
}) {
  const failed = error || snapshot.status === "error";
  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 tablet:mb-6">
      {snapshot.isDemo && (
        <p className="m-0 flex items-center gap-3 type-caption text-fg-2">
          <DemoBadge label={labels.demoBadge} />
          <span>{labels.demoNote}</span>
        </p>
      )}
      <p role="status" className={cn("m-0 inline-flex items-center gap-2 type-caption", failed ? "text-error" : "text-fg-muted")}>
        {failed ? (
          <>
            <Icon name="alert" size={16} />
            {labels.error}
          </>
        ) : snapshot.updatedAt ? (
          <span suppressHydrationWarning>{fill(labels.lastUpdated, { time: updatedTime(snapshot.updatedAt, locale) })}</span>
        ) : (
          labels.notUpdated
        )}
      </p>
    </div>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="m-0 mb-4 type-overline text-fg-2 max-large:sr-only">{children}</h3>;
}

function FollowPicker({
  nations,
  follow,
  onChoose,
  labels,
}: {
  nations: GamesHubProps["nations"];
  follow: string | null;
  onChoose: (code: string | null) => void;
  labels: Dictionary["hub"];
}) {
  const current = nations.find((n) => n.code === follow);
  return (
    <div className="mb-5 flex flex-col gap-3 desktop:mb-6">
      <p id="hub-follow" className="m-0 flex shrink-0 items-center gap-2 type-label text-fg-2">
        <Icon name="star" size={16} className="text-accent" />
        {current ? fill(labels.following, { name: current.name }) : labels.follow}
      </p>
      <ul
        aria-labelledby="hub-follow"
        className="mx-[calc(-1*var(--page-margin))] m-0 flex list-none gap-2 overflow-x-auto px-(--page-margin) py-1 [scrollbar-width:none] desktop:mx-0 desktop:flex-wrap desktop:px-0"
      >
        <li>
          <button
            type="button"
            aria-pressed={!follow}
            onClick={() => onChoose(null)}
            className={cn(
              "inline-flex min-h-touch items-center rounded-pill border px-4 type-caption font-semibold whitespace-nowrap",
              !follow ? "border-accent text-accent" : "border-line text-fg-muted",
            )}
          >
            {labels.followAll}
          </button>
        </li>
        {nations.map((n) => (
          <li key={n.code}>
            <button
              type="button"
              aria-pressed={follow === n.code}
              aria-label={n.name}
              title={n.name}
              onClick={() => onChoose(follow === n.code ? null : n.code)}
              className={cn(
                "inline-flex min-h-touch items-center gap-2 rounded-pill border px-2 transition-colors duration-ui ease-standard",
                follow === n.code ? "border-accent bg-accent/10" : "border-line",
              )}
            >
              <Flag code={n.code} name={n.name} flag={n.flag} decorative />
              <span className="pr-1 type-caption font-semibold">{n.code}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Flags = Map<string, GamesHubProps["nations"][number]>;

function involves(m: Match, code: string | null) {
  return code !== null && (m.home.countryCode === code || m.away.countryCode === code);
}

function LiveList({
  matches,
  changed,
  follow,
  flags,
  locale,
  labels,
}: {
  matches: Match[];
  changed: ChangeSet;
  follow: string | null;
  flags: Flags;
  locale: Locale;
  labels: HubLabels;
}) {
  const order = { live: 0, finished: 1, upcoming: 2, postponed: 3, cancelled: 4 } as const;
  const sorted = [...matches].sort(
    (a, b) => Number(involves(b, follow)) - Number(involves(a, follow)) || order[a.status] - order[b.status],
  );
  const now = sorted.filter((m) => m.status !== "upcoming");
  const next = sorted.filter((m) => m.status === "upcoming").sort((a, b) => (a.startsAt ?? "~").localeCompare(b.startsAt ?? "~"));

  return (
    <div className="flex flex-col gap-3">
      <ul className="m-0 grid list-none gap-3 p-0 tablet:grid-cols-2 tablet:gap-4 large:grid-cols-1 large:gap-3">
        {now.map((m) => (
          <li key={m.id}>
            <ScoreCard match={m} changed={changed} followed={involves(m, follow)} flags={flags} locale={locale} labels={labels} />
          </li>
        ))}
      </ul>
      {next.length > 0 && (
        <>
          <p className="m-0 mt-3 type-overline text-fg-muted">{labels.hub.nextUp}</p>
          <ul className="m-0 grid list-none gap-3 p-0 tablet:grid-cols-2 tablet:gap-4 large:grid-cols-1 large:gap-3">
            {next.map((m) => (
              <li key={m.id}>
                <ScoreCard match={m} changed={changed} followed={involves(m, follow)} flags={flags} locale={locale} labels={labels} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

const kickoffLocale = { en: "en-GB", pt: "pt-PT", fr: "fr-FR" } as const;

const matchTitle = (m: Match, locale: Locale, vs: string) => `${pick(m.home.name, locale)} ${vs} ${pick(m.away.name, locale)}`;

/** Kick-off in Luanda time, e.g. "Sat 17 Jul, 14:00 WAT". */
function kickoff(iso: string, locale: Locale): string {
  return `${new Intl.DateTimeFormat(kickoffLocale[locale], { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Luanda" }).format(new Date(iso))} WAT`;
}

function ScoreCard({
  match: m,
  changed,
  followed,
  flags,
  locale,
  labels,
}: {
  match: Match;
  changed: ChangeSet;
  followed: boolean;
  flags: Flags;
  locale: Locale;
  labels: HubLabels;
}) {
  const status =
    m.status === "live" ? (
      <Badge variant="live">{m.minute !== null ? fill(labels.live.minute, { n: m.minute }) : labels.status.live}</Badge>
    ) : m.status === "finished" ? (
      <Badge variant="finished">{labels.live.fullTime}</Badge>
    ) : m.status === "postponed" || m.status === "cancelled" ? (
      <Badge variant={m.status}>{labels.status[m.status]}</Badge>
    ) : m.status === "upcoming" && m.startsAt ? (
      <Badge variant="upcoming">
        <time dateTime={m.startsAt} suppressHydrationWarning>
          {kickoff(m.startsAt, locale)}
        </time>
      </Badge>
    ) : (
      <Badge variant="upcoming">{labels.status.upcoming}</Badge>
    );

  return (
    <article
      className={cn(
        "rounded-sm border bg-surface-2 p-4 transition-colors duration-ui ease-standard",
        followed ? "border-accent" : "border-line",
        m.status === "live" && "border-l-4 border-l-live",
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-3">
        <p className="m-0 truncate type-caption text-fg-muted">
          <span className="font-semibold text-fg-2">{pick(m.sport, locale)}</span> · {pick(m.round, locale)}
        </p>
        {status}
      </header>
      <dl className="m-0 flex flex-col gap-2">
        {(["home", "away"] as const).map((side) => {
          const s = m[side];
          const key = `match:${m.id}:${side}`;
          const pop = changed.has(key);
          const leading = m.status !== "upcoming" && s.score > m[side === "home" ? "away" : "home"].score;
          return (
            <div key={side} className="flex items-center gap-3">
              <dt className="flex min-w-0 flex-1 items-center gap-3">
                <Flag code={s.countryCode} name={pick(s.name, locale)} flag={flags.get(s.countryCode)?.flag} decorative />
                <span className={cn("truncate type-body-m", leading ? "font-bold text-fg" : "text-fg-2")}>{pick(s.name, locale)}</span>
              </dt>
              <dd className="relative m-0 min-w-7 text-right type-data-m tabular">
                {m.status === "upcoming" ? (
                  <span className="text-fg-muted">–</span>
                ) : (
                  <span key={pop ? `${key}:${s.score}` : key} className={cn(pop && "score-pop")}>
                    {s.score}
                  </span>
                )}
                {pop && <span aria-hidden="true" className="score-sweep absolute inset-x-0 -bottom-1 h-[2px] bg-accent" />}
              </dd>
            </div>
          );
        })}
      </dl>
      {m.status !== "upcoming" && (Boolean(m.sets?.length) || (m.status === "live" && m.setPoints)) && (
        <ol aria-label={labels.live.sets} className="m-0 mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 border-t border-line p-0 pt-3 type-caption text-fg-2">
          {(m.sets ?? []).map((s, i) => (
            <li key={i} className="inline-flex items-center gap-1">
              <span className="text-fg-muted">{fill(labels.live.setN, { n: i + 1 })}</span>
              <span className="tabular">
                {s.home}–{s.away}
              </span>
            </li>
          ))}
          {m.status === "live" && m.setPoints && (
            <li className="inline-flex items-center gap-1 font-semibold text-fg">
              <span aria-hidden="true" className="live-dot size-2 rounded-pill bg-live" />
              <span>{fill(labels.live.setN, { n: (m.sets?.length ?? 0) + 1 })}</span>
              <span className="tabular">
                {m.setPoints.home}–{m.setPoints.away}
              </span>
              <span className="sr-only">({labels.live.setInPlay})</span>
            </li>
          )}
        </ol>
      )}
      {m.status !== "upcoming" && m.timeline.length > 0 && (
        <ol aria-label={labels.live.timeline} className="m-0 mt-3 flex list-none flex-wrap gap-x-4 gap-y-1 border-t border-line p-0 pt-3 type-caption text-fg-2">
          {[...m.timeline]
            .sort((a, b) => a.minute - b.minute)
            .map((e) => (
              <li key={e.id} className="inline-flex items-center gap-1">
                <span className="tabular text-fg-muted">{fill(labels.live.minute, { n: e.minute })}</span>
                <span>
                  {labels.live.events[e.kind]} · {pick(m[e.side].name, locale)}
                </span>
              </li>
            ))}
        </ol>
      )}
      {m.venue && (
        <p className="m-0 mt-3 flex items-center gap-1 truncate type-caption text-fg-muted">
          <Icon name="pin" size={16} /> {pick(m.venue, locale)}
        </p>
      )}
      {m.status === "upcoming" && m.startsAt && (
        <AddToCalendar
          className="mt-2"
          fileName={`cplp2027-${m.id}`}
          label={labels.hub.addToCalendar}
          srLabel={fill(labels.hub.addMatch, { match: matchTitle(m, locale, labels.live.vs) })}
          events={[
            {
              uid: m.id,
              title: `${pick(m.sport, locale)}: ${matchTitle(m, locale, labels.live.vs)}`,
              start: m.startsAt,
              location: m.venue ? pick(m.venue, locale) : undefined,
              description: pick(m.round, locale),
            },
          ]}
        />
      )}
    </article>
  );
}

function ResultsList({
  results,
  follow,
  flags,
  locale,
  labels,
}: {
  results: ResultRow[];
  follow: string | null;
  flags: Flags;
  locale: Locale;
  labels: HubLabels;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, ResultRow[]>();
    for (const r of results) {
      const k = pick(r.event, locale);
      map.set(k, [...(map.get(k) ?? []), r]);
    }
    return [...map.entries()];
  }, [results, locale]);

  if (groups.length === 0) return <EmptyState icon="clock" text={labels.results.noResults} />;

  return (
    <ul className="m-0 grid list-none items-start gap-3 p-0 tablet:grid-cols-2 tablet:gap-4 large:grid-cols-1 large:gap-3">
      {groups.map(([event, rows]) => (
        <li key={event} className="rounded-sm border border-line bg-surface-2 p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h4 className="m-0 type-label">{event}</h4>
            <ShareButton title={event} labels={labels.hub} />
          </div>
          <ol className="m-0 flex list-none flex-col gap-2 p-0">
            {rows.map((r) => (
              <li
                key={r.id}
                className={cn(
                  "flex items-center gap-3 rounded-xs px-2 py-1",
                  r.winner && "bg-accent/10",
                  r.countryCode === follow && "ring-1 ring-accent",
                )}
              >
                <span className={cn("w-5 type-data-m tabular", r.winner ? "text-accent" : "text-fg-muted")}>{r.rank}</span>
                <Flag code={r.countryCode} name={pick(r.country, locale)} flag={flags.get(r.countryCode)?.flag} />
                <span className="min-w-0 flex-1 truncate type-body-s">{pick(r.athlete, locale)}</span>
                <span className="type-label tabular">{r.result}</span>
                {r.winner && (
                  <span className="inline-flex text-accent" title={labels.results.winner}>
                    <Icon name="star" size={16} />
                    <span className="sr-only">{labels.results.winner}</span>
                  </span>
                )}
                {r.corrected && <Badge variant="warning">{labels.results.corrected}</Badge>}
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ul>
  );
}

function ShareButton({ title, labels }: { title: string; labels: Dictionary["hub"] }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = `${location.origin}${location.pathname}#results`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Share sheet dismissed.
    }
  };
  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex min-h-touch shrink-0 items-center gap-2 px-2 type-caption font-semibold text-link"
    >
      <Icon name={copied ? "check" : "share"} size={16} />
      <span aria-live="polite">{copied ? labels.copied : labels.share}</span>
    </button>
  );
}

function MedalTable({
  rows,
  changed,
  follow,
  flags,
  locale,
  labels,
  full,
}: {
  rows: MedalRow[];
  changed: ChangeSet;
  follow: string | null;
  flags: Flags;
  locale: Locale;
  labels: HubLabels;
  /** The Results page shows every nation; the home page keeps the top five. */
  full?: boolean;
}) {
  const [all, setAll] = useState(false);
  const r = labels.results;
  const top = rows.slice(0, 5);
  const followed = rows.find((x) => x.countryCode === follow);
  const shown = all || full ? rows : followed && !top.includes(followed) ? [...top, followed] : top;
  const disc = (color: string) => <span aria-hidden="true" className={cn("mr-1 inline-block size-3 rounded-pill align-[-0.1em]", color)} />;
  const count = "font-medium! text-fg-2";

  return (
    <div className={full ? "max-w-[64rem]" : "max-w-[48rem]"}>
      <DataTable
        caption={r.caption}
        rows={shown}
        getRowKey={(row) => row.countryCode}
        isAccentRow={(row) => row.countryCode === follow}
        highlighted={new Set(shown.filter((row) => changed.has(`medal:${row.countryCode}`)).map((row) => row.countryCode))}
        animateReorder
        labels={{ empty: r.noResults, expand: r.expandRow, collapse: r.collapseRow, sortBy: r.sortBy, sortedAsc: r.sortedAsc, sortedDesc: r.sortedDesc }}
        columns={[
          { key: "rank", header: r.rank, shortHeader: "#", cell: (row) => row.rank, className: "w-6" },
          {
            key: "country",
            header: r.country,
            rowHeader: true,
            cell: (row) => {
              const move = row.previousRank - row.rank;
              const moved = fill(move > 0 ? r.rankUp : r.rankDown, { n: Math.abs(move) });
              return (
                <span className="flex items-center gap-3">
                  <Flag code={row.countryCode} name={pick(row.name, locale)} flag={flags.get(row.countryCode)?.flag} decorative />
                  <span className="truncate type-body-s font-semibold">{pick(row.name, locale)}</span>
                  {move !== 0 && (
                    <span className={cn("inline-flex items-center type-caption", move > 0 ? "text-trend-up" : "text-error")} title={moved}>
                      <Icon name={move > 0 ? "arrow-up" : "arrow-down"} size={16} />
                      <span aria-hidden="true" className="tabular">{Math.abs(move)}</span>
                      <span className="sr-only">{moved}</span>
                    </span>
                  )}
                </span>
              );
            },
          },
          { key: "gold", header: r.gold, shortHeader: r.goldShort, headerMark: disc("bg-medal-gold"), align: "end", className: count, cell: (row) => row.gold },
          { key: "silver", header: r.silver, shortHeader: r.silverShort, headerMark: disc("bg-medal-silver"), align: "end", className: count, cell: (row) => row.silver },
          { key: "bronze", header: r.bronze, shortHeader: r.bronzeShort, headerMark: disc("bg-medal-bronze"), align: "end", className: count, cell: (row) => row.bronze },
          { key: "total", header: r.total, align: "end", className: "font-extrabold!", cell: (row) => row.total },
        ]}
      />
      {rows.length > 5 && !full && (
        <button
          type="button"
          aria-expanded={all}
          onClick={() => setAll((v) => !v)}
          className="mt-3 inline-flex min-h-touch items-center gap-2 type-label text-link"
        >
          {all ? labels.hub.topFive : labels.hub.fullTable}
          <Icon name="chevron-down" size={16} className={cn("transition-transform duration-ui", all && "rotate-180")} />
        </button>
      )}
    </div>
  );
}
