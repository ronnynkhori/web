import { FileCheck2, Info, Lock } from "lucide-react";
import { sports } from "@/data/sports";
import { saveRegistrationRulesForm } from "@/app/admin/actions/registration-rules";
import { Flash } from "@/components/admin/flash";
import { PageHeader, MobileBarSpacer } from "@/components/admin/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { pick } from "@/lib/i18n/config";
import { loadRegistrationRules } from "@/lib/registration/settings";
import { getStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const extras = [
  ["eligibility", "Sports eligibility confirmation", "Signed by the national federation."],
  ["medical", "Medical fitness certificate", "Issued by a doctor within the last six months."],
  ["other", "Other documents", "Any further document the Committee asks for."],
] as const;

const always = ["Passport or valid identification", "Passport-style photograph", "Parent / guardian authorisation (under 18 on 25 March 2027)"];

const groups = ["men", "women", "staff", "judges"] as const;

export default async function RegistrationRulesPage({ searchParams }: PageProps<"/admin/registration-rules">) {
  await requireUser("registrations");
  const query = await searchParams;
  const locale = await getAdminLocale();
  const t = translator(locale);
  const rules = await loadRegistrationRules();
  const writable = getStore().writable;
  const confirmed = Object.keys(rules.quotas).length > 0;
  return (
    <>
      <Flash param="saved" message={query.saved ? t("Saved. The new rules apply to every country from now on.") : null} />
      <PageHeader
        title={t("Quotas and documents")}
        description={t("The rules every submission is checked against. Changes apply to all nine countries immediately, including records already waiting for review.")}
        icon="check"
      />
      {(!writable || query.readonly) && (
        <Alert className="mb-6">
          <Lock />
          <AlertTitle>{t("Read-only")}</AlertTitle>
          <AlertDescription>{t("This deployment cannot store registrations until a database is connected.")}</AlertDescription>
        </Alert>
      )}
      {!confirmed && (
        <Alert className="mb-6 border-highlight bg-warning text-warning-foreground">
          <Info />
          <AlertTitle>{t("Provisional programme")}</AlertTitle>
          <AlertDescription className="text-warning-foreground">{t("These numbers have not been confirmed by the Committee yet. Check them and save to confirm.")}</AlertDescription>
        </Alert>
      )}
      <form action={saveRegistrationRulesForm} className="flex max-w-4xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("Required documents")}</CardTitle>
            <CardDescription>{t("PDF, JPG or PNG, up to 8 MB each. Files are private to the Committee and the country's officer.")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-2">
              {always.map((label) => (
                <li key={label} className="flex items-center gap-2.5 text-sm">
                  <FileCheck2 className="size-4 shrink-0 text-success-foreground" aria-hidden="true" />
                  {t(label)}
                  <span className="text-xs text-muted-foreground">· {t("always required")}</span>
                </li>
              ))}
            </ul>
            <fieldset className="grid gap-2 sm:grid-cols-3">
              <legend className="mb-2 text-sm font-semibold">{t("Also require")}</legend>
              {extras.map(([kind, label, help]) => (
                <label key={kind} className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-checked:border-primary has-checked:bg-secondary">
                  <input type="checkbox" name="extra" value={kind} defaultChecked={rules.extraRequired.includes(kind)} className="mt-0.5 size-4 accent-[var(--tk-color-brand-red)]" />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold">{t(label)}</span>
                    <span className="text-xs text-muted-foreground">{t(help)}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          </CardContent>
        </Card>

        <Card className="gap-0 pb-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">{t("Quota per country")}</CardTitle>
            <CardDescription>{t("The most each country may enter per sport. Rejected records free their place. Numbers in yellow differ from the provisional programme.")}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto px-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/60 hover:bg-muted/60">
                  <TableHead className="pl-4 md:pl-6">{t("Sport")}</TableHead>
                  <TableHead>{t("Birth years")}</TableHead>
                  <TableHead className="text-center">{t("Men")}</TableHead>
                  <TableHead className="text-center">{t("Women")}</TableHead>
                  <TableHead className="text-center">{t("Officials")}</TableHead>
                  <TableHead className="text-center">{t("Judges")}</TableHead>
                  <TableHead className="pr-4 text-right md:pr-6">{t("Total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sports.map((sport) => {
                  const provisional = sport.programme?.quota;
                  const current = rules.quotas[sport.id] ?? provisional;
                  const total = groups.reduce((sum, group) => sum + (current?.[group] ?? 0), 0);
                  const years = sport.programme?.eligibility ? pick(sport.programme.eligibility, locale).match(/\d{4}/g) : null;
                  return (
                    <TableRow key={sport.id}>
                      <TableCell className="pl-4 font-medium md:pl-6">{pick(sport.name, locale)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground tabular-nums">{years && years.length >= 2 ? `${Math.min(...years.map(Number))}–${Math.max(...years.map(Number))}` : "—"}</TableCell>
                      {groups.map((group) => {
                        const changed = provisional && current && provisional[group] !== current[group];
                        return (
                          <TableCell key={group} className="text-center">
                            <input
                              name={`${sport.id}-${group}`}
                              type="number"
                              min={0}
                              max={99}
                              inputMode="numeric"
                              defaultValue={current?.[group] ?? 0}
                              aria-label={`${pick(sport.name, locale)}: ${t(group === "staff" ? "Officials" : group === "men" ? "Men" : group === "women" ? "Women" : "Judges")}`}
                              disabled={!writable}
                              className={cn(
                                "h-9 w-16 rounded-md border border-input bg-background px-2 text-center text-sm tabular-nums shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-70",
                                changed && "border-highlight bg-warning",
                              )}
                            />
                          </TableCell>
                        );
                      })}
                      <TableCell className="pr-4 text-right font-semibold tabular-nums md:pr-6">{total}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="sticky bottom-[calc(var(--tabbar-h)+0.75rem)] z-20 flex items-center justify-between gap-3 rounded-xl border bg-card/95 p-3 shadow-sm backdrop-blur md:bottom-4">
          <p className="text-xs text-muted-foreground">{t("Age is checked against the birth years; minors are measured on 25 March 2027.")}</p>
          <Button type="submit" disabled={!writable}>
            {confirmed ? t("Save changes") : t("Confirm and save")}
          </Button>
        </div>
      </form>
      <MobileBarSpacer />
    </>
  );
}
