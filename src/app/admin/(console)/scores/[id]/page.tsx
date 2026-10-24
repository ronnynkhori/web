import { notFound } from "next/navigation";
import { Info, Trash2 } from "lucide-react";
import { createMatch, deleteMatch, updateFixture } from "@/app/admin/actions/results";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { DocForm } from "@/components/admin/doc-form";
import { Flash } from "@/components/admin/flash";
import { PageHeader } from "@/components/admin/page-header";
import { ScoreDesk } from "@/components/admin/score-desk";
import { kickoffFormatFor } from "@/components/admin/time";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { requireUser } from "@/lib/admin/auth";
import { getCountryOptions, getVenueOptions } from "@/lib/admin/countries";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { loadItems } from "@/lib/admin/mutate";
import { matchFields } from "@/lib/admin/results-fields";
import { canApprove } from "@/lib/admin/roles";
import type { MatchDoc } from "@/lib/cms/types";
import { pick } from "@/lib/i18n/config";

export default async function MatchPage({ params, searchParams }: PageProps<"/admin/scores/[id]">) {
  const session = await requireUser("scores");
  const locale = await getAdminLocale();
  const t = translator(locale);
  const { id } = await params;
  const { fixture } = await searchParams;
  const approver = canApprove(session.role);
  const fields = approver ? matchFields(...(await Promise.all([getCountryOptions(), getVenueOptions()]))) : [];

  if (id === "new") {
    if (!approver) notFound();
    return (
      <div className="max-w-6xl">
        <PageHeader title={t("Add match")} back={{ href: "/admin/scores", label: t("Score desk") }} />
        <DocForm fields={fields} values={{ round: { en: "", pt: "", fr: "" } }} action={createMatch} submitLabel={t("Add match")} cancelHref="/admin/scores" />
      </div>
    );
  }

  const doc = (await loadItems<MatchDoc>("matches")).find((m) => m.id === id);
  if (!doc) notFound();
  if (session.role === "scorer" && !session.sportIds.includes(doc.draft.sportId)) notFound();
  const d = doc.draft;
  const [infoBefore, infoAfter] = t(
    "Live scores go straight to the site. When you mark the match {final}, it waits in Approvals and becomes official once a results manager approves it.",
  ).split("{final}");

  return (
    <div>
      <Flash param="fixture" message={fixture ? "Fixture details saved. The change is on the site." : null} />
      <PageHeader
        title={t("{home} v {away}", { home: pick(d.home.name, locale), away: pick(d.away.name, locale) })}
        description={[
          pick(d.sport, locale),
          pick(d.round, locale),
          d.startsAt ? kickoffFormatFor(locale).format(new Date(d.startsAt)) : t("Time TBC"),
          d.venue && pick(d.venue, locale),
        ]
          .filter(Boolean)
          .join(" · ")}
        back={{ href: "/admin/scores", label: t("Score desk") }}
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <p className="flex items-start gap-2 rounded-lg border bg-info px-3 py-2.5 text-sm text-info-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              {infoBefore}
              <strong>{t("Final")}</strong>
              {infoAfter}
            </span>
          </p>
          <ScoreDesk initial={d} rev={doc.rev ?? 0} approval={doc.approval} note={doc.note} canApprove={approver} />
        </div>
        {approver && (
          <Card className="xl:sticky xl:top-20">
            <CardHeader>
              <CardTitle className="text-base">{t("Fixture details")}</CardTitle>
              <CardDescription>{t("Teams, kick-off and venue as shown on the schedule.")}</CardDescription>
            </CardHeader>
            <CardContent>
              <DocForm
                layout="inline"
                fields={fields}
                values={{ sportId: d.sportId, round: d.round, home: d.home.countryCode, away: d.away.countryCode, startsAt: d.startsAt, venueId: doc.venueId }}
                action={updateFixture.bind(null, doc.id)}
                submitLabel={t("Save fixture")}
              />
            </CardContent>
            <CardFooter className="justify-between gap-3 border-t [.border-t]:pt-5">
              <span className="text-xs text-muted-foreground">{t("Removes it from the schedule and results.")}</span>
              <ConfirmAction
                action={deleteMatch.bind(null, doc.id)}
                title={t("Delete this match?")}
                description={t("It disappears from the schedule and results on the site.")}
                confirmLabel={t("Delete match")}
                destructive
                trigger={
                  <Button variant="outline" size="sm" className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 /> {t("Delete match")}
                  </Button>
                }
              />
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
