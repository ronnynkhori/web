import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CalendarClock, CircleAlert, CircleCheck, CircleDashed, ClipboardCheck, Database, Hourglass, Info, UserRound, UsersRound } from "lucide-react";
import { FlagChip } from "@/components/admin/flag-chip";
import { CountryTable } from "@/components/admin/registration/country-table";
import { byQueue, countryName, sportName, statusLabel, statusTone } from "@/components/admin/registration/meta";
import { Pipeline } from "@/components/admin/registration/pipeline";
import { StatusBadge } from "@/components/admin/status-badge";
import { relativeTime, shortName } from "@/components/admin/time";
import { Alert, AlertDescription, AlertTitle } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardIcon, CardTitle, type CardTone } from "@/components/admin/ui/card";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { intlLocale, translator, type Translate } from "@/lib/admin/i18n/translate";
import { loadItems } from "@/lib/admin/mutate";
import { can, roleLabels } from "@/lib/admin/roles";
import type { UserDoc } from "@/lib/cms/types";
import { loadDelegations, loadParticipants, registrationDemoActive } from "@/lib/registration/data";
import { demoUsers } from "@/lib/registration/demo";
import { countryProgress, statusCounts } from "@/lib/registration/review";
import { loadRegistrationRules } from "@/lib/registration/settings";
import { getStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const zone = "Africa/Luanda";
const hourFormat = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: zone });
const registrationCollections = ["participants", "delegations", "participantFiles", "registrationNotices", "registrationRules", "users"];

function greeting(now: Date, name: string, t: Translate) {
  const h = Number(hourFormat.format(now));
  return h < 12 ? t("Good morning, {name}", { name }) : h < 18 ? t("Good afternoon, {name}", { name }) : t("Good evening, {name}", { name });
}

function StatCard({ label, value, sub, href, tone, icon }: { label: string; value: number; sub: string; href: string; tone: CardTone; icon: ReactNode }) {
  return (
    <Link href={href} className="group block rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none">
      <Card tone={tone} className="h-full gap-3 py-5 transition-colors group-hover:border-primary/40 md:py-5">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <CardIcon tone={tone}>{icon}</CardIcon>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
          <span className="font-display text-5xl leading-none tracking-wide tabular-nums">{value}</span>
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold leading-snug">{label}</span>
            <span className="text-xs text-muted-foreground">{sub}</span>
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}

function Step({ done, title, detail, href, cta }: { done: boolean; title: string; detail: string; href?: string; cta?: string }) {
  return (
    <li className="flex gap-3 px-4 py-3 md:px-6">
      {done ? <CircleCheck className="mt-0.5 size-5 shrink-0 text-success-foreground" aria-hidden="true" /> : <CircleDashed className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("text-sm font-semibold", done && "text-muted-foreground")}>{title}</span>
        <span className="text-xs text-muted-foreground">{detail}</span>
      </span>
      {!done && href && cta && (
        <Link href={href} className="self-center text-xs font-semibold whitespace-nowrap text-primary hover:underline">
          {cta}
        </Link>
      )}
    </li>
  );
}

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const session = await requireUser();
  const query = await searchParams;
  const locale = await getAdminLocale();
  const t = translator(locale);
  const store = getStore();
  const [people, delegations, users, rules, demo, activity] = await Promise.all([
    loadParticipants(),
    loadDelegations(),
    loadItems<UserDoc>("users").catch(() => [] as UserDoc[]),
    loadRegistrationRules(),
    registrationDemoActive(),
    can(session.role, "activity")
      ? store.listAudit(40).catch((error) => {
          console.error("[admin] activity feed unavailable", error);
          return [];
        })
      : Promise.resolve([]),
  ]);
  const now = new Date();
  const dayFormat = new Intl.DateTimeFormat(intlLocale(locale), { weekday: "long", day: "numeric", month: "long", timeZone: zone });
  const counts = statusCounts(people);
  const waiting = people.filter((person) => person.status === "submitted" || person.status === "review").sort(byQueue);
  const active = [...users.filter((user) => user.active), ...(demo ? demoUsers : [])];
  const progress = countryProgress(people, delegations, active);
  const officers = progress.filter((row) => row.officer).length;
  const profiles = progress.filter((row) => row.delegation).length;
  const supers = active.filter((user) => user.role === "super").length;
  const mail = Boolean((process.env.RESEND_API_KEY && process.env.REGISTRATION_MAIL_FROM) || process.env.REGISTRATION_MAIL_WEBHOOK);
  const live = people.filter((person) => person.status !== "rejected");
  const bySport = [...live.reduce((map, person) => (person.sportId ? map.set(person.sportId, (map.get(person.sportId) ?? 0) + 1) : map), new Map<string, number>())].sort((a, b) => b[1] - a[1]);
  const topSport = bySport[0]?.[1] ?? 0;
  const recent = activity.filter((entry) => !entry.collection || registrationCollections.includes(entry.collection)).slice(0, 6);
  const oldestWait = waiting[0]?.submittedAt;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <header className="relative overflow-hidden rounded-2xl bg-sidebar px-5 py-6 text-sidebar-foreground shadow-sm md:px-8 md:py-7">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full border-[28px] border-sidebar-primary/15" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-widest text-sidebar-foreground/70 uppercase">{dayFormat.format(now)} · Luanda</p>
            <h1 className="font-display text-[2.25rem] leading-none tracking-wide md:text-[3rem]">{greeting(now, session.name.split(" ")[0], t)}</h1>
            <p className="flex flex-wrap items-center gap-2 text-sm text-sidebar-foreground/85">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sidebar-primary px-2.5 py-0.5 text-xs font-bold text-sidebar-primary-foreground">
                <CalendarClock className="size-3.5" aria-hidden="true" /> {t(roleLabels[session.role])}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sidebar-border px-2.5 py-0.5 text-xs font-semibold">
                <Database className="size-3.5" aria-hidden="true" /> {store.kind === "supabase" ? t("Online storage") : t("Local storage")}
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <p className="text-sm text-sidebar-foreground/85">
              {waiting.length === 0
                ? t("Nothing is waiting for review.")
                : t("{n} waiting for review · oldest {when}", { n: waiting.length, when: relativeTime(oldestWait, t) })}
            </p>
            {waiting[0] && (
              <Button asChild size="lg" className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
                <Link href={`/admin/registrations/${waiting[0].id}`}>
                  <ClipboardCheck /> {t("Start reviewing")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {query.denied && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>{t("No access")}</AlertTitle>
          <AlertDescription>{t("Your role does not have access to that area. Ask a Super admin if you need it.")}</AlertDescription>
        </Alert>
      )}
      {demo && (
        <Alert className="border-info-foreground/20 bg-info">
          <Info />
          <AlertTitle>{t("Demonstration data")}</AlertTitle>
          <AlertDescription>{t("No database is connected, so sample registrations are shown. They disappear as soon as a delegation saves a real one.")}</AlertDescription>
        </Alert>
      )}

      <section aria-label={t("At a glance")} className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label={t("Athletes")} value={live.filter((p) => p.kind === "athlete").length} sub={t("Across every country")} href="/admin/registrations?kind=athlete" tone="brand" icon={<UserRound />} />
        <StatCard label={t("Coaches and officials")} value={live.filter((p) => p.kind === "official").length} sub={t("Across every country")} href="/admin/registrations?kind=official" tone="info" icon={<UsersRound />} />
        <StatCard label={t("Waiting for review")} value={waiting.length} sub={t("Submitted or under review")} href="/admin/registrations?status=waiting" tone="warning" icon={<Hourglass />} />
        <StatCard label={t("Approved registrations")} value={counts.approved} sub={t("Registration number issued")} href="/admin/registrations?status=approved" tone="success" icon={<ClipboardCheck />} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("Registration flow")}</CardTitle>
          <p className="text-xs text-muted-foreground">{t("Draft → Submitted → Under review → Correction required → Approved or Rejected")}</p>
        </CardHeader>
        <CardContent>
          <Pipeline counts={counts} t={t} hrefFor={(status) => `/admin/registrations?status=${status}`} />
        </CardContent>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4 [.border-b]:pb-4">
            <CardTitle className="text-base">{t("Review queue")}</CardTitle>
            <CardAction>
              <Button asChild variant="ghost" size="sm" className="-my-1 text-primary">
                <Link href="/admin/registrations?status=waiting">
                  {t("Open the full list")} <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="px-0">
            {waiting.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground md:px-6">{t("Nothing is waiting for review.")}</p>
            ) : (
              <ul className="divide-y">
                {waiting.slice(0, 7).map((person) => (
                  <li key={person.id}>
                    <Link href={`/admin/registrations/${person.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/60 md:px-6">
                      <FlagChip code={person.countryCode} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{person.fullName || "—"}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {[countryName(person.countryCode, locale), sportName(person.sportId, locale), person.submittedAt && t("Submitted {when}", { when: relativeTime(person.submittedAt, t) })].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <StatusBadge tone={statusTone[person.status]}>{t(statusLabel[person.status])}</StatusBadge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4 [.border-b]:pb-4">
            <CardTitle className="text-base">{t("Ready to open registration?")}</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <ul className="divide-y">
              <Step done={store.kind === "supabase" && store.writable} title={t("Database connected")} detail={store.kind === "supabase" ? t("Records and documents are stored online.") : t("Needed before real passports and photos are uploaded.")} />
              <Step done={officers === 9} title={t("Officer accounts: {n} of 9", { n: officers })} detail={t("One authorised officer per country.")} href={can(session.role, "users") ? "/admin/delegations" : undefined} cta={t("Create")} />
              <Step done={profiles === 9} title={t("Delegation profiles: {n} of 9", { n: profiles })} detail={t("Filled in by each officer after signing in.")} href="/admin/delegations" cta={t("See who")} />
              <Step done={Object.keys(rules.quotas).length > 0} title={t("Quotas and documents confirmed")} detail={Object.keys(rules.quotas).length > 0 ? t("Saved by the Committee.") : t("Still the provisional programme.")} href="/admin/registration-rules" cta={t("Review")} />
              <Step done={mail} title={t("Email notifications")} detail={mail ? t("Officers are emailed on submission, approval and corrections.") : t("Not configured: notices show on the officer's dashboard only.")} />
              {session.role === "super" && <Step done={supers >= 2} title={t("Two Super admins")} detail={t("So someone can always reset a password.")} href="/admin/users/new" cta={t("Add")} />}
            </ul>
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-base font-semibold">{t("Countries")}</h2>
          <Link href="/admin/delegations" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            {t("Delegations")} <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <CountryTable rows={progress} locale={locale} t={t} canManageUsers={can(session.role, "users")} />
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4 [.border-b]:pb-4">
            <CardTitle className="text-base">{t("Participants by sport")}</CardTitle>
          </CardHeader>
          <CardContent className="py-4">
            {bySport.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("No sport entries yet.")}</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {bySport.map(([sportId, count]) => (
                  <li key={sportId}>
                    <Link href={`/admin/registrations?sport=${sportId}`} className="grid grid-cols-[8.5rem_1fr_2rem] items-center gap-3 text-sm hover:text-primary">
                      <span className="truncate">{sportName(sportId, locale)}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-muted">
                        <span className="block h-full rounded-full bg-[var(--tk-color-brand-blue)]" style={{ width: `${(count / topSport) * 100}%` }} />
                      </span>
                      <span className="text-right font-semibold tabular-nums">{count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {can(session.role, "activity") && (
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4 [.border-b]:pb-4">
              <CardTitle className="text-base">{t("Recent activity")}</CardTitle>
              <CardAction>
                <Button asChild variant="ghost" size="sm" className="-my-1 text-primary">
                  <Link href="/admin/activity">
                    {t("All activity")} <ArrowRight />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="px-0">
              {recent.length === 0 ? (
                <p className="px-6 py-4 text-sm text-muted-foreground">{t("Nothing yet.")}</p>
              ) : (
                <ul className="divide-y">
                  {recent.map((entry, index) => (
                    <li key={`${entry.at}-${index}`} className="flex items-baseline gap-3 px-4 py-2.5 text-sm md:px-6">
                      <span className="w-16 shrink-0 text-xs text-muted-foreground tabular-nums">{relativeTime(entry.at, t)}</span>
                      <span className="min-w-0 flex-1 truncate">
                        <strong className="font-semibold">{shortName(entry.actor, t)}</strong> {t(entry.action)} <span className="text-muted-foreground">{entry.summary ? `“${entry.summary}”` : ""}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
