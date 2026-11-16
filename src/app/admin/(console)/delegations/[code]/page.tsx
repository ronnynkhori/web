import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileSpreadsheet, Mail, Phone, Printer, UserPlus } from "lucide-react";
import { FlagChip } from "@/components/admin/flag-chip";
import { MobileBarSpacer, PageHeader } from "@/components/admin/page-header";
import { byQueue, countryName, sportName, statusLabel, statusTone } from "@/components/admin/registration/meta";
import { Pipeline } from "@/components/admin/registration/pipeline";
import { StatusBadge } from "@/components/admin/status-badge";
import { relativeTime } from "@/components/admin/time";
import { Button } from "@/components/admin/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { countries } from "@/data/countries";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { loadItems } from "@/lib/admin/mutate";
import { can } from "@/lib/admin/roles";
import type { UserDoc } from "@/lib/cms/types";
import { regCopy } from "@/lib/registration/copy";
import { loadDelegation, loadParticipants } from "@/lib/registration/data";
import { quotaUse, statusCounts } from "@/lib/registration/review";
import { loadRegistrationRules } from "@/lib/registration/settings";
import { cn } from "@/lib/utils";

export default async function DelegationPage({ params }: PageProps<"/admin/delegations/[code]">) {
  const session = await requireUser("registrations");
  const { code } = await params;
  if (!countries.some((country) => country.code === code)) notFound();
  const locale = await getAdminLocale();
  const t = translator(locale);
  const copy = regCopy(locale);
  const [all, delegation, users, rules] = await Promise.all([loadParticipants(), loadDelegation(code), loadItems<UserDoc>("users").catch(() => []), loadRegistrationRules()]);
  const people = all.filter((person) => person.countryCode === code);
  const officer = users.find((user) => user.role === "delegation" && user.countryCode === code);
  const counts = statusCounts(people);
  const usage = quotaUse(all, code, rules);
  const recent = [...people].sort((a, b) => (b._updatedAt ?? "").localeCompare(a._updatedAt ?? "")).slice(0, 8);
  const waiting = people.filter((person) => person.status === "submitted" || person.status === "review").sort(byQueue);
  const name = countryName(code, locale);

  const profile: [string, string][] = delegation
    ? [
        [copy.institution, delegation.institution],
        [copy.headName, delegation.headName],
        [copy.headPosition, delegation.headPosition],
        [copy.email, delegation.email],
        [copy.telephone, delegation.telephone],
        [copy.officerName, delegation.officerName],
        [copy.officerContact, delegation.officerContact],
        [copy.estimatedAthletes, String(delegation.estimatedAthletes)],
        [copy.estimatedOfficials, String(delegation.estimatedOfficials)],
      ]
    : [];

  return (
    <>
      <PageHeader
        title={name}
        back={{ href: "/admin/delegations", label: t("Delegations") }}
        meta={
          <>
            <FlagChip code={code} size="md" />
            <StatusBadge tone={delegation ? "success" : "neutral"}>{delegation ? t("Profile complete") : t("Profile not filled in")}</StatusBadge>
            <StatusBadge tone={officer ? (officer.active ? "success" : "neutral") : "warning"}>
              {officer ? (officer.active ? t("Officer active") : t("Officer deactivated")) : t("No officer account")}
            </StatusBadge>
          </>
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <a href={`/api/registration/export?country=${code}`}>
                <FileSpreadsheet /> {t("Excel")}
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/registrations/print?country=${code}`}>
                <Printer /> {t("PDF / print")}
              </Link>
            </Button>
            {waiting[0] && (
              <Button asChild>
                <Link href={`/admin/registrations/${waiting[0].id}`}>
                  {t("Review {n} waiting", { n: waiting.length })} <ArrowRight />
                </Link>
              </Button>
            )}
          </>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("Registration progress")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Pipeline counts={counts} t={t} hrefFor={(status) => `/admin/registrations?country=${code}&status=${status}`} />
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-3.5 [.border-b]:pb-3.5">
              <CardTitle className="text-sm">{t("Quota use by sport")}</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              {usage.length === 0 ? (
                <p className="px-4 py-5 text-sm text-muted-foreground md:px-6">{t("No sport entries yet.")}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-4 md:pl-6">{t("Sport")}</TableHead>
                        <TableHead className="text-right">{t("Men")}</TableHead>
                        <TableHead className="text-right">{t("Women")}</TableHead>
                        <TableHead className="text-right">{t("Officials")}</TableHead>
                        <TableHead className="pr-4 text-right md:pr-6">{t("Judges")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usage.map((row) => (
                        <TableRow key={row.sportId}>
                          <TableCell className="pl-4 font-medium md:pl-6">{sportName(row.sportId, locale)}</TableCell>
                          {(["men", "women", "staff", "judges"] as const).map((group, index) => {
                            const limit = row.quota?.[group];
                            const over = limit !== undefined && row.used[group] > limit;
                            const full = limit !== undefined && row.used[group] === limit && limit > 0;
                            return (
                              <TableCell key={group} className={cn("text-right tabular-nums", index === 3 && "pr-4 md:pr-6")}>
                                <span className={cn("rounded px-1.5 py-0.5", over && "bg-destructive/10 font-bold text-destructive", full && "bg-warning font-semibold text-warning-foreground")}>
                                  {row.used[group]}
                                  <span className="text-muted-foreground"> / {limit ?? "—"}</span>
                                </span>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-3.5 [.border-b]:pb-3.5">
              <CardTitle className="text-sm">{t("Latest changes")}</CardTitle>
              <CardAction>
                <Button asChild variant="ghost" size="sm" className="-my-1 text-primary">
                  <Link href={`/admin/registrations?country=${code}`}>
                    {t("All {n}", { n: people.length })} <ArrowRight />
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="px-0">
              {recent.length === 0 ? (
                <p className="px-4 py-5 text-sm text-muted-foreground md:px-6">{t("The officer has not registered anyone yet.")}</p>
              ) : (
                <ul className="divide-y">
                  {recent.map((person) => (
                    <li key={person.id}>
                      <Link href={`/admin/registrations/${person.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-accent/60 md:px-6">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{person.fullName || "—"}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {[person.kind === "athlete" ? t("Athlete") : t("Official"), sportName(person.sportId, locale), relativeTime(person._updatedAt, t)].filter(Boolean).join(" · ")}
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
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("Delegation officer")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {officer ? (
                <>
                  <span className="font-semibold">{officer.name}</span>
                  <a href={`mailto:${officer.email}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                    <Mail className="size-4" aria-hidden="true" /> {officer.email}
                  </a>
                  {can(session.role, "users") && (
                    <Link href={`/admin/users/${officer.id}`} className="text-xs text-muted-foreground hover:underline">
                      {t("Manage account and password")}
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">{t("Nobody can register this country until an officer account exists.")}</p>
                  {can(session.role, "users") && (
                    <Button asChild size="sm" className="self-start">
                      <Link href={`/admin/users/new?country=${code}`}>
                        <UserPlus /> {t("Create officer account")}
                      </Link>
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t("Delegation profile")}</CardTitle>
            </CardHeader>
            <CardContent>
              {delegation ? (
                <dl className="flex flex-col gap-3">
                  {profile
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="text-sm font-medium break-words">
                          {label === copy.telephone ? (
                            <a href={`tel:${value.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 hover:underline">
                              <Phone className="size-3.5" aria-hidden="true" /> {value}
                            </a>
                          ) : (
                            value
                          )}
                        </dd>
                      </div>
                    ))}
                  <div>
                    <dt className="text-xs text-muted-foreground">{copy.sports}</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {delegation.sports.map((id) => (
                        <StatusBadge key={id} tone="neutral">
                          {sportName(id, locale)}
                        </StatusBadge>
                      ))}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted-foreground">{t("The officer fills this in after signing in for the first time.")}</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
      <MobileBarSpacer />
    </>
  );
}
