import { Trash2 } from "lucide-react";
import { addAdjustment, removeAdjustment } from "@/app/admin/actions/results";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { DocForm } from "@/components/admin/doc-form";
import { Flash } from "@/components/admin/flash";
import { FlagChip } from "@/components/admin/flag-chip";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { requireUser } from "@/lib/admin/auth";
import { getCountryOptions } from "@/lib/admin/countries";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { loadItems } from "@/lib/admin/mutate";
import { adjustmentFields } from "@/lib/admin/results-fields";
import type { EventResultDoc, MedalAdjustmentDoc } from "@/lib/cms/types";
import { pick } from "@/lib/i18n/config";
import { computeMedals } from "@/lib/live/medals";
import { cn } from "@/lib/utils";

function MedalHead({ tone, label }: { tone: string; label: string }) {
  return (
    <TableHead className="h-11 w-14 text-center md:w-20">
      <span className="inline-flex items-center gap-1.5">
        <span aria-hidden="true" className={cn("size-3 rounded-full", tone)} />
        <span className="sr-only md:not-sr-only">{label}</span>
      </span>
    </TableHead>
  );
}

function Count({ n }: { n: number }) {
  return <span className={cn("font-display text-xl leading-none tabular-nums", n === 0 && "text-muted-foreground/50")}>{n}</span>;
}

export default async function MedalsPage({ searchParams }: PageProps<"/admin/medals">) {
  await requireUser("medals");
  const locale = await getAdminLocale();
  const t = translator(locale);
  const query = await searchParams;
  const [results, adjustments, countryOptions] = await Promise.all([
    loadItems<EventResultDoc>("results"),
    loadItems<MedalAdjustmentDoc>("medalAdjustments"),
    getCountryOptions(),
  ]);
  const table = computeMedals(results, adjustments);
  const medalEvents = results.filter((r) => r.medalEvent && r.published?.length).length;

  return (
    <>
      <Flash param="saved" message={query.saved ? "Adjustment saved. The medal table on the site is updated." : null} />
      <PageHeader
        title={t("Medal table")}
        description={
          medalEvents === 1
            ? t(
                "Calculated automatically from 1 published medal event (places 1 to 3), plus the adjustments below. You never type the table by hand.",
              )
            : t(
                "Calculated automatically from {n} published medal events (places 1 to 3), plus the adjustments below. You never type the table by hand.",
                { n: medalEvents },
              )
        }
        icon="trophy"
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="border-b py-4 [.border-b]:pb-4">
            <CardTitle className="text-base">{t("As shown on the site")}</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableHead className="h-11 w-10 pl-4 md:pl-6">#</TableHead>
                <TableHead className="h-11">{t("Country")}</TableHead>
                <MedalHead tone="bg-medal-gold" label={t("Gold")} />
                <MedalHead tone="bg-medal-silver" label={t("Silver")} />
                <MedalHead tone="bg-medal-bronze" label={t("Bronze")} />
                <TableHead className="h-11 w-14 pr-4 text-center md:w-20 md:pr-6">{t("Total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.map((r) => (
                <TableRow key={r.countryCode}>
                  <TableCell className="pl-4 tabular-nums text-muted-foreground md:pl-6">{r.rank}</TableCell>
                  <TableCell className="max-w-0">
                    <span className="flex items-center gap-2.5">
                      <FlagChip code={r.countryCode} size="md" />
                      <span className="truncate font-medium">
                        <span className="md:hidden">{r.countryCode}</span>
                        <span className="hidden md:inline">{pick(r.name, locale)}</span>
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Count n={r.gold} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Count n={r.silver} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Count n={r.bronze} />
                  </TableCell>
                  <TableCell className="pr-4 text-center md:pr-6">
                    <span className="font-display text-xl leading-none tabular-nums text-primary">{r.total}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("Add an adjustment")}</CardTitle>
              <CardDescription>
                {t(
                  "For medals that do not come from an event result here: team events, results imported from another system, or a disqualification after the event.",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocForm layout="inline" fields={adjustmentFields(countryOptions)} values={{}} action={addAdjustment} submitLabel={t("Save adjustment")} />
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-4 [.border-b]:pb-4">
              <CardTitle className="text-base">{t("Adjustments ({n})", { n: adjustments.length })}</CardTitle>
            </CardHeader>
            {adjustments.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground md:px-6">{t("No adjustments. The table comes only from event results.")}</p>
            ) : (
              <ul className="divide-y">
                {adjustments.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 py-3 pr-2 pl-4 md:pl-6">
                    <FlagChip code={a.countryCode} size="md" className="mt-0.5" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold tabular-nums">
                        <span>{a.countryCode}</span>
                        {(
                          [
                            ["bg-medal-gold", a.gold, "{n} gold"],
                            ["bg-medal-silver", a.silver, "{n} silver"],
                            ["bg-medal-bronze", a.bronze, "{n} bronze"],
                          ] as const
                        ).map(([tone, n, label]) => (
                          <span key={label} className="inline-flex items-center gap-1" aria-label={t(label, { n })}>
                            <span aria-hidden="true" className={cn("size-2.5 rounded-full", tone)} />
                            {n > 0 ? `+${n}` : n}
                          </span>
                        ))}
                      </p>
                      {a.reason && <p className="text-xs text-muted-foreground">{a.reason}</p>}
                    </div>
                    <ConfirmAction
                      action={removeAdjustment.bind(null, a.id)}
                      title={t("Remove this adjustment?")}
                      description={t("The medal table on the site is recalculated straight away.")}
                      confirmLabel={t("Remove")}
                      destructive
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={t("Remove adjustment for {country}", { country: a.countryCode })} className="text-muted-foreground hover:text-destructive">
                          <Trash2 />
                        </Button>
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
