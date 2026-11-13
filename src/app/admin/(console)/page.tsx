import Link from "next/link";
import { ArrowRight, CalendarClock, CircleAlert, ClipboardList, Database } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { relativeTime, shortName } from "@/components/admin/time";
import { Alert, AlertDescription, AlertTitle } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardIcon, CardTitle, type CardTone } from "@/components/admin/ui/card";
import { countries } from "@/data/countries";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { intlLocale, translator, type Translate } from "@/lib/admin/i18n/translate";
import { can, roleLabels } from "@/lib/admin/roles";
import { pick } from "@/lib/i18n/config";
import { loadParticipants } from "@/lib/registration/data";
import type { RegistrationStatus } from "@/lib/registration/model";
import { getStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const zone = "Africa/Luanda";
const hourFormat = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: zone });

const statusLabel: Record<RegistrationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  review: "Under review",
  correction: "Needs correction",
  approved: "Approved",
  rejected: "Rejected",
};

function greeting(now: Date, name: string, t: Translate) {
  const h = Number(hourFormat.format(now));
  return h < 12 ? t("Good morning, {name}", { name }) : h < 18 ? t("Good afternoon, {name}", { name }) : t("Good evening, {name}", { name });
}

function StatCard({ label, value, sub, href, tone }: { label: string; value: number; sub: string; href?: string; tone: CardTone }) {
  const body = (
    <Card tone={tone} className={cn("h-full gap-3 py-5 md:py-5", href && "transition-colors group-hover:border-primary/40 group-hover:bg-accent/40")}>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <CardIcon tone={tone}>
            <ClipboardList />
          </CardIcon>
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

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const session = await requireUser();
  const query = await searchParams;
  const locale = await getAdminLocale();
  const t = translator(locale);
  const store = getStore();
  const [people, activity] = await Promise.all([
    loadParticipants(),
    can(session.role, "activity") ? store.listAudit(12) : Promise.resolve([]),
  ]);
  const now = new Date();
  const dayFormat = new Intl.DateTimeFormat(intlLocale(locale), { weekday: "long", day: "numeric", month: "long", timeZone: zone });
  const count = (status: RegistrationStatus) => people.filter((person) => person.status === status).length;
  const waiting = people.filter((person) => person.status === "submitted" || person.status === "review");
  const countryName = (code: string) => pick(countries.find((item) => item.code === code)?.name ?? { en: code, pt: code }, locale);
  const recent = activity.filter((entry) => !entry.collection || ["participants", "delegations", "participantFiles", "registrationNotices", "registrationRules", "users"].includes(entry.collection));

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <header className="relative overflow-hidden rounded-2xl bg-sidebar px-5 py-6 text-sidebar-foreground shadow-sm md:px-8 md:py-7">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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
          <p className="max-w-sm text-sm text-sidebar-foreground/75">{t("Review what each country has submitted.")}</p>
        </div>
      </header>

      {query.denied && (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>{t("No access")}</AlertTitle>
          <AlertDescription>{t("Your role does not have access to that area. Ask a Super admin if you need it.")}</AlertDescription>
        </Alert>
      )}

      <section aria-label={t("At a glance")} className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label={t("Athletes")} value={people.filter((person) => person.kind === "athlete").length} sub={t("Across every country")} href="/admin/registrations" tone="brand" />
        <StatCard label={t("Officials")} value={people.filter((person) => person.kind === "official").length} sub={t("Across every country")} href="/admin/registrations" tone="info" />
        <StatCard label={t("Waiting for review")} value={waiting.length} sub={t("Submitted or under review")} href="/admin/registrations?status=submitted" tone="warning" />
        <StatCard label={t("Needs correction")} value={count("correction")} sub={t("Sent back to the officer")} href="/admin/registrations?status=correction" tone="warning" />
        <StatCard label={t("Approved")} value={count("approved")} sub={t("Registration number issued")} href="/admin/registrations?status=approved" tone="success" />
        <StatCard label={t("Rejected")} value={count("rejected")} sub={t("Not accepted")} href="/admin/registrations?status=rejected" tone="live" />
        <StatCard label={t("Drafts")} value={count("draft")} sub={t("Not submitted yet")} href="/admin/registrations?status=draft" tone="info" />
      </section>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4 [.border-b]:pb-4">
          <CardTitle className="text-base">{t("Waiting for review")}</CardTitle>
          <CardAction>
            <Button asChild variant="ghost" size="sm" className="-my-1 text-primary">
              <Link href="/admin/registrations">
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
              {waiting.slice(0, 8).map((person) => (
                <li key={person.id}>
                  <Link href={`/admin/registrations/${person.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/60 md:px-6">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{person.fullName || "—"}</span>
                      <span className="block truncate text-xs text-muted-foreground">{countryName(person.countryCode)}</span>
                    </span>
                    <StatusBadge tone={person.status === "review" ? "warning" : "info"}>{t(statusLabel[person.status])}</StatusBadge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {can(session.role, "activity") && (
        <Card className="gap-0 py-0">
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
            {recent.length === 0 ? (
              <p className="px-6 py-4 text-sm text-muted-foreground">{t("Nothing yet.")}</p>
            ) : (
              <ul className="divide-y">
                {recent.slice(0, 6).map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="flex items-baseline gap-3 px-4 py-2 text-sm md:px-6">
                    <span className="w-16 shrink-0 text-xs text-muted-foreground tabular-nums">{relativeTime(entry.at, t)}</span>
                    <span className="min-w-0 flex-1 truncate">
                      <strong className="font-semibold">{shortName(entry.actor, t)}</strong> {t(entry.action)}{" "}
                      <span className="text-muted-foreground">{entry.summary ? `“${entry.summary}”` : entry.collection}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
