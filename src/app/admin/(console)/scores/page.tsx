import Link from "next/link";
import { ChevronRight, Trash2 } from "lucide-react";
import { deleteMatch, deleteMatches } from "@/app/admin/actions/results";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { EmptyState } from "@/components/admin/empty-state";
import { FlagChip } from "@/components/admin/flag-chip";
import { IconAction } from "@/components/admin/icon-action";
import { Flash } from "@/components/admin/flash";
import { BulkSelect, SelectAllBox, SelectBox } from "@/components/admin/item-list-select";
import { MobileBarSpacer, PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { kickoffFormatFor } from "@/components/admin/time";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator, type Translate } from "@/lib/admin/i18n/translate";
import { loadItems } from "@/lib/admin/mutate";
import { canApprove } from "@/lib/admin/roles";
import type { MatchDoc } from "@/lib/cms/types";
import { pick, type Locale } from "@/lib/i18n/config";
import type { EventStatus } from "@/lib/live/types";
import { cn } from "@/lib/utils";

const groups: Array<{ label: string; statuses: EventStatus[] }> = [
  { label: "Live now", statuses: ["live"] },
  { label: "Coming up", statuses: ["upcoming", "postponed"] },
  { label: "Finished", statuses: ["finished", "cancelled"] },
];

function ManagedCard({ m, t, locale }: { m: MatchDoc; t: Translate; locale: Locale }) {
  const d = m.draft;
  const title = t("{home} v {away}", { home: pick(d.home.name, locale), away: pick(d.away.name, locale) });
  return (
    <div className="relative h-full">
      <MatchCard m={m} t={t} locale={locale} manage />
      <SelectBox id={m.id} label={title} className="absolute top-4 right-4" />
      <ConfirmAction
        action={deleteMatch.bind(null, m.id)}
        title={t("Delete {title}?", { title })}
        description={t("It disappears from the schedule and results on the site. This cannot be undone.")}
        confirmLabel={t("Delete match")}
        destructive
        trigger={
          <IconAction label={t("Delete {title}", { title })} icon={<Trash2 />} destructive className="absolute right-2 bottom-2 bg-card" />
        }
      />
    </div>
  );
}

function MatchCard({ m, t, locale, manage }: { m: MatchDoc; t: Translate; locale: Locale; manage?: boolean }) {
  const d = m.draft;
  const live = d.status === "live";
  const bar = live ? "before:bg-live" : m.approval === "pending" ? "before:bg-highlight" : d.status === "finished" ? "before:bg-success-foreground" : "";
  return (
    <Link
      href={`/admin/scores/${m.id}`}
      className={cn(
        "group relative flex h-full flex-col gap-3 overflow-hidden rounded-xl border bg-card p-4 pt-5 shadow-xs transition-colors hover:border-primary/40 hover:bg-accent/50 active:bg-accent",
        bar && `before:absolute before:inset-x-0 before:top-0 before:h-1 before:content-[''] ${bar}`,
        live && "border-live/40 ring-1 ring-live/20",
      )}
    >
      <span className={cn("flex min-h-5 flex-wrap items-center gap-1.5", manage && "pr-8")}>
        {live && (
          <StatusBadge tone="live">
            {t("Live")}
            {d.minute ? ` ${d.minute}′` : ""}
          </StatusBadge>
        )}
        {d.status === "postponed" && <StatusBadge tone="warning">{t("Postponed")}</StatusBadge>}
        {d.status === "cancelled" && <StatusBadge tone="neutral">{t("Cancelled")}</StatusBadge>}
        {m.approval === "pending" && <StatusBadge tone="warning">{t("Waiting for approval")}</StatusBadge>}
        {m.approval === "rejected" && <StatusBadge tone="error">{t("Returned")}</StatusBadge>}
        {d.corrected && <StatusBadge tone="info">{t("Corrected")}</StatusBadge>}
        <span className="text-xs font-semibold text-primary">{pick(d.sport, locale)}</span>
      </span>
      <span className="flex flex-col gap-2">
        {(["home", "away"] as const).map((side) => (
          <span key={side} className="flex items-center gap-3">
            <FlagChip code={d[side].countryCode} size="md" />
            <span className="min-w-0 flex-1 truncate font-semibold">{pick(d[side].name, locale)}</span>
            <span className="font-display text-3xl leading-none tabular-nums">{d.status === "upcoming" ? "–" : d[side].score}</span>
          </span>
        ))}
      </span>
      <span className="mt-auto flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
        <span className="min-w-0 flex-1 truncate">
          {[pick(d.round, locale), d.startsAt ? kickoffFormatFor(locale).format(new Date(d.startsAt)) : t("Time TBC"), d.venue && pick(d.venue, locale)]
            .filter(Boolean)
            .join(" · ")}
        </span>
        {!manage && <ChevronRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
        {manage && <span aria-hidden="true" className="w-6 shrink-0" />}
      </span>
    </Link>
  );
}

export default async function ScoresPage({ searchParams }: PageProps<"/admin/scores">) {
  const session = await requireUser("scores");
  const locale = await getAdminLocale();
  const t = translator(locale);
  const query = await searchParams;
  const all = await loadItems<MatchDoc>("matches");
  const mine = session.role === "scorer" ? all.filter((m) => session.sportIds.includes(m.draft.sportId)) : all;
  const approver = canApprove(session.role);

  const groupsView = (
    <div className="flex flex-col gap-8">
      {approver && mine.length > 1 && (
        <label className="-mb-4 flex items-center gap-2 self-start text-xs font-medium text-muted-foreground">
          <SelectAllBox /> {t("Select all matches")}
        </label>
      )}
      {groups.map((group) => {
        const items = mine
          .filter((m) => group.statuses.includes(m.draft.status))
          .sort((a, b) => (a.draft.startsAt ?? "~").localeCompare(b.draft.startsAt ?? "~"));
        if (!items.length) return null;
        return (
          <section key={group.label} aria-labelledby={`g-${group.statuses[0]}`} className="flex flex-col gap-3">
            <h2 id={`g-${group.statuses[0]}`} className="flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              {t(group.label)}
              <span className="rounded-full border bg-card px-2 py-0.5 text-xs font-semibold text-foreground">{items.length}</span>
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((m) => (
                <li key={m.id}>{approver ? <ManagedCard m={m} t={t} locale={locale} /> : <MatchCard m={m} t={t} locale={locale} />}</li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );

  return (
    <>
      <Flash param="deleted" message={query.deleted ? "Match deleted. It is gone from the schedule and results." : null} />
      <PageHeader
        title={t("Score desk")}
        description={t(
          "Tap a match to enter the score. Live scores appear on the site within seconds; every final score waits in Approvals until a results manager publishes it.",
        )}
        icon="live"
        primary={approver ? { href: "/admin/scores/new", label: t("Add match") } : undefined}
      />
      {mine.length === 0 && (
        <EmptyState icon="live" title={approver ? t("No matches yet") : t("No matches assigned to you yet")}>
          {approver ? t("Use “Add match” to create the first fixture.") : t("Ask a results manager to assign your sport.")}
        </EmptyState>
      )}
      {approver ? (
        <BulkSelect ids={mine.map((m) => m.id)} action={deleteMatches} noun="matches" description="They disappear from the schedule and results on the site. This cannot be undone.">
          {groupsView}
        </BulkSelect>
      ) : (
        groupsView
      )}
      {approver && <MobileBarSpacer />}
    </>
  );
}
