import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { approve, approveAll, reject } from "@/app/admin/actions/results";
import { ApprovalDecision, ApproveAll } from "@/components/admin/approval-decision";
import { EmptyState } from "@/components/admin/empty-state";
import { FlagChip } from "@/components/admin/flag-chip";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { relativeTime, shortName } from "@/components/admin/time";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/admin/ui/tabs";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator, type Translate } from "@/lib/admin/i18n/translate";
import { getStore } from "@/lib/store";
import { loadItems } from "@/lib/admin/mutate";
import type { EventResultDoc, EventResultRow, MatchDoc } from "@/lib/cms/types";
import { pick, type Locale } from "@/lib/i18n/config";
import type { Match } from "@/lib/live/types";
import { cn } from "@/lib/utils";

const statusText: Record<Match["status"], string> = {
  upcoming: "Not started",
  live: "Live",
  finished: "Final",
  postponed: "Postponed",
  cancelled: "Cancelled",
};

function Compare({ submitted, current, t }: { submitted: ReactNode; current: ReactNode; t: Translate }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-2 rounded-lg border-2 border-primary/30 bg-secondary p-3">
        <dt className="text-xs font-semibold tracking-wide text-primary uppercase">{t("Submitted")}</dt>
        <dd>{submitted}</dd>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3">
        <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("On the site now")}</dt>
        <dd className="text-muted-foreground">{current}</dd>
      </div>
    </dl>
  );
}

function MatchLine({ m, strong, t, locale }: { m: Match | null; strong?: boolean; t: Translate; locale: Locale }) {
  if (!m) return <span className="text-sm">{t("Not published")}</span>;
  return (
    <span className="flex flex-col gap-1.5">
      {(["home", "away"] as const).map((side) => (
        <span key={side} className="flex items-center gap-2">
          <FlagChip code={m[side].countryCode} />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{pick(m[side].name, locale)}</span>
          <span className={cn("font-display leading-none tabular-nums", strong ? "text-3xl text-foreground" : "text-2xl")}>{m[side].score}</span>
        </span>
      ))}
      <span className="text-xs">{t(statusText[m.status])}</span>
    </span>
  );
}

function Placings({ rows, t }: { rows: EventResultRow[] | null; t: Translate }) {
  if (!rows?.length) return <span className="text-sm">{t("Not published")}</span>;
  return (
    <ol className="flex flex-col gap-1.5">
      {[...rows]
        .sort((a, b) => a.rank - b.rank)
        .map((r) => (
          <li key={`${r.rank}-${r.athlete}`} className="flex items-center gap-2 text-sm">
            <span className="w-5 text-right font-display text-lg leading-none tabular-nums">{r.rank}</span>
            <FlagChip code={r.countryCode} />
            <span className="min-w-0 flex-1 truncate">{r.athlete}</span>
            <span className="font-medium tabular-nums">{r.result}</span>
          </li>
        ))}
    </ol>
  );
}

const decidedActions = new Set(["approved", "rejected", "published result"]);

export default async function ApprovalsPage() {
  await requireUser("approvals");
  const locale = await getAdminLocale();
  const t = translator(locale);
  const [matches, results, audit] = await Promise.all([
    loadItems<MatchDoc>("matches"),
    loadItems<EventResultDoc>("results"),
    getStore().listAudit(300),
  ]);
  const pendingMatches = matches.filter((m) => m.approval === "pending");
  const pendingResults = results.filter((r) => r.approval === "pending");
  const total = pendingMatches.length + pendingResults.length;
  const decided = audit
    .filter((a) => decidedActions.has(a.action) && (a.collection === "matches" || a.collection === "results"))
    .slice(0, 20);
  const waiting = <WaitingList pendingMatches={pendingMatches} pendingResults={pendingResults} t={t} locale={locale} />;

  return (
    <div>
      <PageHeader
        title={t("Approvals")}
        meta={total > 0 && <StatusBadge tone="warning">{t("{n} waiting", { n: total })}</StatusBadge>}
        description={t(
          "Every final score and event result lands here, including ones entered by results managers. Nothing is official until it is approved; until then the site keeps the last published score. Changing a published result marks it “Corrected” on the site.",
        )}
        icon="check"
        actions={total > 1 && <ApproveAll count={total} action={approveAll} />}
      />
      <Tabs defaultValue="waiting" className="gap-5">
        <TabsList className="h-10 self-start">
          <TabsTrigger value="waiting" className="px-4">
            {t("Waiting ({n})", { n: total })}
          </TabsTrigger>
          <TabsTrigger value="decided" className="px-4">
            {t("Recently decided")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="decided">
          {decided.length === 0 ? (
            <EmptyState icon="clock" title={t("No decisions yet")} tone="info">
              {t("Approved and returned scores appear here.")}
            </EmptyState>
          ) : (
            <Card className="gap-0 py-0">
              <ul className="divide-y">
                {decided.map((a, i) => {
                  const exists = a.collection === "matches" ? matches.some((m) => m.id === a.itemId) : results.some((r) => r.id === a.itemId);
                  const href = exists ? (a.collection === "matches" ? `/admin/scores/${a.itemId}` : `/admin/results/${a.itemId}`) : null;
                  const returned = a.action === "rejected";
                  const body = (
                    <>
                      <StatusBadge tone={returned ? "error" : "success"}>{returned ? t("Returned") : t("Approved")}</StatusBadge>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        <span className="font-medium">{a.summary ?? a.itemId}</span>
                        <span className="text-muted-foreground"> · {a.collection === "matches" ? t("score") : t("result")}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {shortName(a.actor, t)} · {relativeTime(a.at, t)}
                      </span>
                    </>
                  );
                  return (
                    <li key={`${a.at}-${i}`}>
                      {href ? (
                        <Link href={href} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-accent/60 md:px-6">
                          {body}
                        </Link>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-6">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="waiting">{waiting}</TabsContent>
      </Tabs>
    </div>
  );
}

function WaitingList({
  pendingMatches,
  pendingResults,
  t,
  locale,
}: {
  pendingMatches: MatchDoc[];
  pendingResults: EventResultDoc[];
  t: Translate;
  locale: Locale;
}) {
  if (!pendingMatches.length && !pendingResults.length) {
    return (
      <EmptyState icon="check" title={t("All clear")} tone="success">
        {t("Nothing is waiting for approval.")}
      </EmptyState>
    );
  }
  const from = (email: string | undefined) => t("from {name}", { name: email ? shortName(email, t) : t("scorer") });
  return (
    <div className="grid items-start gap-4 xl:grid-cols-2">
      {pendingMatches.map((m) => {
        const home = pick(m.draft.home.name, locale);
        const away = pick(m.draft.away.name, locale);
        const label = `${home} ${m.draft.home.score} – ${m.draft.away.score} ${away}`;
        return (
          <Card key={m.id} tone="warning" className="gap-4">
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge tone="warning">{t("Final score")}</StatusBadge>
                <span className="text-xs font-semibold text-primary">{pick(m.draft.sport, locale)}</span>
              </div>
              <CardTitle className="text-base">{t("{home} v {away}", { home, away })}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {[pick(m.draft.round, locale), from(m.submittedBy), relativeTime(m._updatedAt, t)].filter(Boolean).join(" · ")}
              </p>
            </CardHeader>
            <CardContent>
              <Compare
                t={t}
                submitted={<MatchLine m={m.draft} strong t={t} locale={locale} />}
                current={<MatchLine m={m.published} t={t} locale={locale} />}
              />
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3 border-t md:flex-row md:items-center md:justify-between [.border-t]:pt-4">
              <Link href={`/admin/scores/${m.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                {t("Open in score desk")} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <ApprovalDecision label={label} approveAction={approve.bind(null, "match", m.id)} rejectAction={reject.bind(null, "match", m.id)} />
            </CardFooter>
          </Card>
        );
      })}
      {pendingResults.map((r) => {
        const event = pick(r.event, locale);
        return (
          <Card key={r.id} tone="warning" className="gap-4">
            <CardHeader className="gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge tone="warning">{t("Event result")}</StatusBadge>
                {r.medalEvent && <StatusBadge tone="brand">{t("Medal event")}</StatusBadge>}
              </div>
              <CardTitle className="text-base">{event}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {from(r.submittedBy)} · {relativeTime(r._updatedAt, t)}
              </p>
            </CardHeader>
            <CardContent>
              <Compare t={t} submitted={<Placings rows={r.draft} t={t} />} current={<Placings rows={r.published} t={t} />} />
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-3 border-t md:flex-row md:items-center md:justify-between [.border-t]:pt-4">
              <Link href={`/admin/results/${r.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                {t("Open result")} <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <ApprovalDecision label={event} approveAction={approve.bind(null, "result", r.id)} rejectAction={reject.bind(null, "result", r.id)} />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
