import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  CircleAlert,
  Clock,
  Database,
  Languages,
  Megaphone,
  Radio,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { approve, reject } from "@/app/admin/actions/results";
import { AdminIcon } from "@/components/admin/admin-icon";
import { ApprovalDecision } from "@/components/admin/approval-decision";
import { FlagChip } from "@/components/admin/flag-chip";
import { adminNav } from "@/components/admin/nav-items";
import { StatusBadge } from "@/components/admin/status-badge";
import { kickoffFormatFor, relativeTime, shortName } from "@/components/admin/time";
import { Alert, AlertDescription, AlertTitle } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardIcon, CardTitle, type CardTone } from "@/components/admin/ui/card";
import { competitionStart, gamesEnd } from "@/data/event";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { intlLocale, translator, type Translate } from "@/lib/admin/i18n/translate";
import { loadItems } from "@/lib/admin/mutate";
import { can, canApprove, roleLabels } from "@/lib/admin/roles";
import { collectionDefs, missingTranslations } from "@/lib/admin/schemas";
import type { AnnouncementDoc, EventResultDoc, GuideDoc, MatchDoc, SettingsDoc } from "@/lib/cms/types";
import { pick, type Locale } from "@/lib/i18n/config";
import type { Match } from "@/lib/live/types";
import { gameDay } from "@/lib/phase";
import { getStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const zone = "Africa/Luanda";
// Only read as a number, so it stays in a fixed locale.
const hourFormat = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: zone });
const DAY = 86_400_000;

const dayFormatFor = (locale: Locale) => new Intl.DateTimeFormat(intlLocale(locale), { weekday: "long", day: "numeric", month: "long", timeZone: zone });

/** Stored activity actions are English; bulk deletes carry a count. */
function actionText(action: string, t: Translate) {
  const bulk = /^deleted (\d+) items$/.exec(action);
  return bulk ? t("deleted {n} items", { n: bulk[1] }) : t(action);
}

function greeting(now: Date, name: string, t: Translate) {
  const h = Number(hourFormat.format(now));
  return h < 12 ? t("Good morning, {name}", { name }) : h < 18 ? t("Good afternoon, {name}", { name }) : t("Good evening, {name}", { name });
}

function gamesLine(now: Date, t: Translate) {
  const ms = now.getTime();
  const start = Date.parse(competitionStart);
  if (ms < start) {
    const days = Math.ceil((start - ms) / DAY);
    return days === 1 ? t("Competition starts tomorrow") : t("{n} days to the first competition day", { n: days });
  }
  if (ms <= Date.parse(gamesEnd)) {
    const { day, total } = gameDay(now);
    return t("Games day {day} of {total}", { day, total });
  }
  return t("The Games have finished");
}

function StatCard({
  label,
  value,
  sub,
  href,
  icon,
  tone,
}: {
  label: string;
  value: number | string;
  sub: string;
  href?: string;
  icon: ReactNode;
  tone: CardTone;
}) {
  const body = (
    <Card tone={tone} className={cn("h-full gap-3 py-5 md:py-5", href && "transition-colors group-hover:border-primary/40 group-hover:bg-accent/40")}>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <CardIcon tone={tone}>{icon}</CardIcon>
          {href && <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
        </div>
        <span className="font-display text-5xl leading-none tracking-wide tabular-nums">{value}</span>
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold leading-snug">{label}</span>
          <span className="text-xs text-muted-foreground">{sub}</span>
        </span>
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href} className="group block rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none">
      {body}
    </Link>
  ) : (
    body
  );
}

function PanelTitle({ icon, tone, children }: { icon: ReactNode; tone: CardTone; children: ReactNode }) {
  return (
    <CardTitle className="flex items-center gap-3 text-base">
      <CardIcon tone={tone} className="size-8 [&_svg]:size-4">
        {icon}
      </CardIcon>
      {children}
    </CardTitle>
  );
}

function MatchRow({ m, scores, locale, t }: { m: MatchDoc; scores: boolean; locale: Locale; t: Translate }) {
  const d: Match = m.draft;
  const live = d.status === "live";
  const body = (
    <>
      <span className="flex w-20 shrink-0 flex-col gap-1">
        {live ? (
          <StatusBadge tone="live">{d.minute ? t("Live {minute}′", { minute: d.minute }) : t("Live")}</StatusBadge>
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">{d.startsAt ? kickoffFormatFor(locale).format(new Date(d.startsAt)) : t("Time TBC")}</span>
        )}
        <span className="truncate text-xs font-semibold text-primary">{pick(d.sport, locale)}</span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        {(["home", "away"] as const).map((side) => (
          <span key={side} className="flex items-center gap-2">
            <FlagChip code={d[side].countryCode} />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{pick(d[side].name, locale)}</span>
            <span className="font-display text-xl leading-none tabular-nums">{d.status === "upcoming" ? "–" : d[side].score}</span>
          </span>
        ))}
      </span>
    </>
  );
  const cls = "flex items-center gap-3 px-4 py-3 md:px-6";
  return scores ? (
    <Link href={`/admin/scores/${m.id}`} className={cn(cls, "hover:bg-accent/60")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const session = await requireUser();
  const query = await searchParams;
  const locale = await getAdminLocale();
  const t = translator(locale);
  const kickoffFormat = kickoffFormatFor(locale);
  const store = getStore();
  const role = session.role;
  const healthDefs = collectionDefs.filter((d) => can(role, d.area));
  const [matches, results, announcements, settings, activity, healthItems] = await Promise.all([
    loadItems<MatchDoc>("matches"),
    loadItems<EventResultDoc>("results"),
    loadItems<AnnouncementDoc>("announcements"),
    loadItems<SettingsDoc>("settings"),
    can(role, "activity") ? store.listAudit(5) : Promise.resolve([]),
    Promise.all(healthDefs.map((d) => loadItems(d.id))),
  ]);

  const now = new Date();
  const ms = now.getTime();
  const approver = canApprove(role);
  const scores = can(role, "scores");
  const visibleMatches = role === "scorer" ? matches.filter((m) => session.sportIds.includes(m.draft.sportId)) : matches;
  const liveMatches = visibleMatches.filter((m) => m.draft.status === "live");
  const upcoming = visibleMatches
    .filter((m) => m.draft.status === "upcoming")
    .sort((a, b) => (a.draft.startsAt ?? "~").localeCompare(b.draft.startsAt ?? "~"))
    .slice(0, 5);
  const pendingMatches = matches.filter((m) => m.approval === "pending");
  const pendingResults = results.filter((r) => r.approval === "pending");
  const pending = pendingMatches.length + pendingResults.length;
  const returned = [
    ...matches
      .filter((m) => m.approval === "rejected" && (role !== "scorer" || session.sportIds.includes(m.draft.sportId)))
      .map((m) => ({
        id: m.id,
        href: `/admin/scores/${m.id}`,
        title: t("{home} v {away}", { home: pick(m.draft.home.name, locale), away: pick(m.draft.away.name, locale) }),
        note: m.note,
      })),
    ...results
      .filter((r) => r.approval === "rejected" && (role !== "scorer" || session.sportIds.includes(r.sportId)))
      .map((r) => ({ id: r.id, href: `/admin/results/${r.id}`, title: pick(r.event, locale), note: r.note })),
  ];
  const published = announcements.filter((a) => a.status === "published");
  const expiring = published.filter((a) => a.expiresAt && Date.parse(a.expiresAt) > ms && Date.parse(a.expiresAt) - ms < 3 * DAY);
  const translationGaps = healthDefs
    .map((def, i) => ({
      def,
      count: healthItems[i].filter((doc) => missingTranslations(def, doc as unknown as Record<string, unknown>).length > 0).length,
    }))
    .filter((g) => g.count > 0);
  const missingTotal = translationGaps.reduce((n, g) => n + g.count, 0);
  const guideIndex = healthDefs.findIndex((d) => d.id === "guide");
  const guideToCome = guideIndex >= 0 ? (healthItems[guideIndex] as GuideDoc[]).filter((g) => g.status === "required").length : 0;
  const banner = settings[0]?.banner;
  const shortcuts = adminNav.flatMap((g) => g.items).filter((i) => i.href !== "/admin" && can(role, i.area));
  const firstName = session.name.split(" ")[0];

  const needsYou = [
    ...pendingMatches.map((m) => ({
      key: `m-${m.id}`,
      kind: t("Final score"),
      title: `${pick(m.draft.home.name, locale)} ${m.draft.home.score} – ${m.draft.away.score} ${pick(m.draft.away.name, locale)}`,
      sub: [pick(m.draft.sport, locale), m.submittedBy && t("from {name}", { name: shortName(m.submittedBy, t) }), relativeTime(m._updatedAt, t)]
        .filter(Boolean)
        .join(" · "),
      href: `/admin/scores/${m.id}`,
      approveAction: approve.bind(null, "match", m.id),
      rejectAction: reject.bind(null, "match", m.id),
      at: m._updatedAt ?? "",
    })),
    ...pendingResults.map((r) => ({
      key: `r-${r.id}`,
      kind: t("Event result"),
      title: pick(r.event, locale),
      sub: [r.submittedBy && t("from {name}", { name: shortName(r.submittedBy, t) }), relativeTime(r._updatedAt, t)].filter(Boolean).join(" · "),
      href: `/admin/results/${r.id}`,
      approveAction: approve.bind(null, "result", r.id),
      rejectAction: reject.bind(null, "result", r.id),
      at: r._updatedAt ?? "",
    })),
  ]
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(0, 5);

  const activityList = (
    <ul className="divide-y">
      {activity.map((a, i) => (
        <li key={`${a.at}-${i}`} className="flex items-baseline gap-3 px-4 py-2 text-sm md:px-6">
          <span className="w-16 shrink-0 text-xs text-muted-foreground tabular-nums">{relativeTime(a.at, t)}</span>
          <span className="min-w-0 flex-1 truncate">
            <strong className="font-semibold">{shortName(a.actor, t)}</strong> {actionText(a.action, t)}{" "}
            <span className="text-muted-foreground">{a.summary ? `“${a.summary}”` : a.collection}</span>
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <header className="relative overflow-hidden rounded-2xl bg-sidebar px-5 py-6 text-sidebar-foreground shadow-sm md:px-8 md:py-7">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_80%_20%,color-mix(in_oklab,var(--highlight)_28%,transparent),transparent_60%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-widest text-sidebar-foreground/70 uppercase">{dayFormatFor(locale).format(now)} · Luanda</p>
            <h1 className="font-display text-[2.25rem] leading-none tracking-wide md:text-[3rem]">
              {greeting(now, firstName, t)}
            </h1>
            <p className="flex flex-wrap items-center gap-2 text-sm text-sidebar-foreground/85">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sidebar-primary px-2.5 py-0.5 text-xs font-bold text-sidebar-primary-foreground">
                <CalendarClock className="size-3.5" aria-hidden="true" /> {gamesLine(now, t)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sidebar-border px-2.5 py-0.5 text-xs font-semibold">
                {t(roleLabels[role])}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sidebar-border px-2.5 py-0.5 text-xs font-semibold">
                <Database className="size-3.5" aria-hidden="true" /> {store.kind === "supabase" ? t("Online storage") : t("Local storage")}
              </span>
            </p>
          </div>
          <p className="max-w-sm text-sm text-sidebar-foreground/75">{t("Everything you publish here appears on the public site within seconds.")}</p>
        </div>
      </header>

      {(query.denied || banner?.enabled) && (
        <div className="flex flex-col gap-3">
          {query.denied && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>{t("No access")}</AlertTitle>
              <AlertDescription>{t("Your role does not have access to that area. Ask a Super admin if you need it.")}</AlertDescription>
            </Alert>
          )}
          {banner?.enabled && (
            <Alert className="border-highlight bg-warning text-warning-foreground">
              <Megaphone />
              <AlertTitle>{t("The site-wide alert banner is on")}</AlertTitle>
              <AlertDescription className="text-warning-foreground">
                <p>“{pick(banner.message, locale)}”</p>
                {can(role, "settings") && (
                  <Link href="/admin/settings" className="font-semibold underline underline-offset-2">
                    {t("Change it in Site settings")}
                  </Link>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <section aria-label={t("At a glance")} className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          label={t("Matches live now")}
          value={liveMatches.length}
          sub={
            upcoming[0]
              ? t("Next: {home} v {away}", { home: upcoming[0].draft.home.countryCode, away: upcoming[0].draft.away.countryCode })
              : t("Nothing scheduled next")
          }
          icon={<Radio />}
          href={scores ? "/admin/scores" : undefined}
          tone="live"
        />
        <StatCard
          label={t("Waiting for approval")}
          value={pending}
          sub={
            pending
              ? `${pendingMatches.length === 1 ? t("1 score") : t("{n} scores", { n: pendingMatches.length })} · ${
                  pendingResults.length === 1 ? t("1 result") : t("{n} results", { n: pendingResults.length })
                }`
              : t("All clear")
          }
          icon={<ShieldCheck />}
          href={can(role, "approvals") ? "/admin/approvals" : undefined}
          tone="warning"
        />
        <StatCard
          label={t("Announcements live")}
          value={published.length}
          sub={
            expiring.length
              ? t("{n} expiring in 3 days", { n: expiring.length })
              : announcements.length - published.length === 1
                ? t("1 draft")
                : t("{n} drafts", { n: announcements.length - published.length })
          }
          icon={<Megaphone />}
          href={can(role, "announcements") ? "/admin/c/announcements" : undefined}
          tone="brand"
        />
        <StatCard
          label={t("Items missing PT or EN")}
          value={missingTotal}
          sub={
            missingTotal
              ? translationGaps.length === 1
                ? t("Across 1 section")
                : t("Across {n} sections", { n: translationGaps.length })
              : t("Every section translated")
          }
          icon={<Languages />}
          tone="info"
        />
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        {approver ? (
          <Card tone="warning" className="gap-0 py-0">
            <CardHeader className="border-b py-4 [.border-b]:pb-4">
              <PanelTitle icon={<ShieldCheck />} tone="warning">
                {t("Needs you now")}
              </PanelTitle>
              <CardAction>
                <Button asChild variant="ghost" size="sm" className="-my-1 text-primary">
                  <Link href="/admin/approvals">
                    {pending > needsYou.length ? t("Approvals ({n})", { n: pending }) : t("Approvals")} <ArrowRight />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="px-0">
              {needsYou.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground md:px-6">{t("Nothing waiting. Final scores and results appear here for you to approve.")}</p>
              ) : (
                <ul className="divide-y">
                  {needsYou.map((n) => (
                    <li key={n.key} className="flex flex-col gap-3 px-4 py-3 md:px-6 lg:flex-row lg:items-center">
                      <Link href={n.href} className="flex min-w-0 flex-1 flex-col gap-1 hover:underline">
                        <span className="text-xs font-semibold text-warning-foreground">{n.kind}</span>
                        <span className="truncate text-sm font-semibold">{n.title}</span>
                        <span className="truncate text-xs text-muted-foreground">{n.sub}</span>
                      </Link>
                      <ApprovalDecision label={n.title} approveAction={n.approveAction} rejectAction={n.rejectAction} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ) : (
          returned.length > 0 && (
            <Card tone="live" className="gap-0 py-0">
              <CardHeader className="border-b py-4 [.border-b]:pb-4">
                <PanelTitle icon={<TriangleAlert />} tone="live">
                  {t("Returned to you")}
                </PanelTitle>
              </CardHeader>
              <CardContent className="px-0">
                <ul className="divide-y">
                  {returned.slice(0, 5).map((r) => (
                    <li key={r.id}>
                      <Link href={r.href} className="flex flex-col gap-1 px-4 py-3 hover:bg-accent/60 md:px-6">
                        <span className="text-sm font-semibold">{r.title}</span>
                        {r.note && <span className="text-xs text-muted-foreground">“{r.note}”</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        )}

        {scores && (
          <Card tone="live" className="gap-0 py-0">
            <CardHeader className="border-b py-4 [.border-b]:pb-4">
              <PanelTitle icon={<Radio />} tone="live">
                {t("Live and next")}
              </PanelTitle>
              <CardAction>
                <Button asChild variant="ghost" size="sm" className="-my-1 text-primary">
                  <Link href="/admin/scores">
                    {t("Score desk")} <ArrowRight />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="px-0">
              {liveMatches.length + upcoming.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground md:px-6">{t("No live or upcoming matches.")}</p>
              ) : (
                <ul className="divide-y">
                  {[...liveMatches, ...upcoming].map((m) => (
                    <li key={m.id}>
                      <MatchRow m={m} scores={scores} locale={locale} t={t} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        {(translationGaps.length > 0 || guideToCome > 0 || expiring.length > 0) && (
          <Card tone="info" className="gap-0 py-0">
            <CardHeader className="border-b py-4 [.border-b]:pb-4">
              <PanelTitle icon={<Languages />} tone="info">
                {t("Content health")}
              </PanelTitle>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="divide-y">
                {translationGaps.map((g) => (
                  <li key={g.def.id}>
                    <Link href={`/admin/c/${g.def.id}`} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/60 md:px-6">
                      <AdminIcon name={g.def.icon} className="size-4 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate font-medium">{t(g.def.label)}</span>
                      <StatusBadge tone="warning">{t("{n} missing PT/EN", { n: g.count })}</StatusBadge>
                      <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
                {guideToCome > 0 && (
                  <li>
                    <Link href="/admin/c/guide" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/60 md:px-6">
                      <AdminIcon name="info" className="size-4 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate font-medium">{t("Guide topics still to come")}</span>
                      <StatusBadge tone="info">{guideToCome}</StatusBadge>
                      <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                )}
                {expiring.map((a) => (
                  <li key={a.id}>
                    <Link href={`/admin/c/announcements/${encodeURIComponent(a.id)}`} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/60 md:px-6">
                      <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate font-medium">{pick(a.title, locale)}</span>
                      <StatusBadge tone="warning">{t("Hides {date}", { date: kickoffFormat.format(new Date(a.expiresAt!)) })}</StatusBadge>
                      <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <section aria-labelledby="quick-actions" className="flex flex-col gap-3">
        <h2 id="quick-actions" className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {t("Quick actions")}
        </h2>
        <ul className="flex flex-wrap gap-2">
          {shortcuts.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-semibold shadow-xs transition-colors hover:border-primary/40 hover:bg-accent"
              >
                <AdminIcon name={s.icon} className="size-4 text-primary" />
                {t(s.label)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {can(role, "activity") && (
        <section aria-labelledby="recent-activity">
          <details className="group rounded-xl border bg-card shadow-xs md:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold">
              <span id="recent-activity">{t("Recent activity")}</span>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden="true" />
            </summary>
            <div className="border-t">
              {activity.length ? activityList : <p className="px-4 py-4 text-sm text-muted-foreground">{t("Nothing yet.")}</p>}
              <Link href="/admin/activity" className="flex items-center gap-1 border-t px-4 py-3 text-sm font-semibold text-primary">
                {t("All activity")} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </details>
          <Card className="hidden gap-0 py-0 md:flex">
            <CardHeader className="border-b py-3 [.border-b]:pb-3">
              <CardTitle className="text-sm">{t("Recent activity")}</CardTitle>
              <CardAction>
                <Button asChild variant="ghost" size="sm" className="-my-1 text-primary">
                  <Link href="/admin/activity">
                    {t("All activity")} <ArrowRight />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="px-0">
              {activity.length ? activityList : <p className="px-6 py-4 text-sm text-muted-foreground">{t("Nothing yet. Changes appear here as the team works.")}</p>}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
