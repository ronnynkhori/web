import Link from "next/link";
import { FileSpreadsheet, Info, Printer } from "lucide-react";
import { EmptyState } from "@/components/admin/empty-state";
import { FlagChip } from "@/components/admin/flag-chip";
import { ItemList, type ListRow } from "@/components/admin/item-list";
import { MobileBarSpacer, PageHeader } from "@/components/admin/page-header";
import { FilterBar } from "@/components/admin/registration/filter-bar";
import { byQueue, countryName, sportName, statusLabel, statusTone } from "@/components/admin/registration/meta";
import { relativeTime } from "@/components/admin/time";
import { Alert, AlertDescription, AlertTitle } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { applyFilter, filterQuery, matchesStatus, readFilter, type StatusFilter } from "@/lib/registration/filter";
import { loadParticipants, registrationDemoActive } from "@/lib/registration/data";
import { isMinor } from "@/lib/registration/rules";
import { cn } from "@/lib/utils";

const tabs: { value: StatusFilter; label: string }[] = [
  { value: "", label: "All" },
  { value: "waiting", label: "Waiting for review" },
  { value: "correction", label: "Correction required" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Drafts" },
];

export default async function RegistrationsPage({ searchParams }: PageProps<"/admin/registrations">) {
  await requireUser("registrations");
  const query = await searchParams;
  const locale = await getAdminLocale();
  const t = translator(locale);
  const filter = readFilter((name) => {
    const value = query[name];
    return Array.isArray(value) ? value[0] : value;
  });
  const [all, demo] = await Promise.all([loadParticipants(), registrationDemoActive()]);
  const scoped = applyFilter(all, filter, false);
  const people = scoped.filter((person) => matchesStatus(person, filter.status));
  const queueFirst = filter.status === "waiting" || filter.status === "submitted" || filter.status === "review";
  people.sort(queueFirst ? byQueue : (a, b) => (b._updatedAt ?? "").localeCompare(a._updatedAt ?? ""));

  const rows: ListRow[] = people.map((person) => {
    const sport = sportName(person.sportId, locale);
    const when =
      person.status === "draft"
        ? t("Started {when}", { when: relativeTime(person._updatedAt, t) })
        : person.decidedAt && !queueFirst
          ? t("Decided {when}", { when: relativeTime(person.decidedAt, t) })
          : person.submittedAt
            ? t("Submitted {when}", { when: relativeTime(person.submittedAt, t) })
            : relativeTime(person._updatedAt, t);
    return {
      id: person.id,
      href: `/admin/registrations/${person.id}`,
      title: person.fullName || "—",
      subtitle: [countryName(person.countryCode, locale), sport, person.discipline !== "—" ? person.discipline : "", person.registrationNumber].filter(Boolean).join(" · "),
      leading: <FlagChip code={person.countryCode} size="md" />,
      meta: when,
      badges: [
        { label: t(statusLabel[person.status]), tone: statusTone[person.status] },
        { label: person.kind === "athlete" ? t("Athlete") : t("Official"), tone: "neutral" },
        ...(isMinor(person.dateOfBirth) ? [{ label: t("Minor"), tone: "warning" as const }] : []),
      ],
    };
  });

  const { status: _status, ...rest } = filter;
  void _status;
  const hrefFor = (status: StatusFilter) => `/admin/registrations${filterQuery({ ...rest, status })}`;
  const exportQuery = filterQuery(filter);
  const hasFilter = Boolean(filter.q || filter.country || filter.sport || filter.kind);

  return (
    <>
      <PageHeader
        title={t("Registrations")}
        description={t("Every athlete and official the delegations have entered. Open a record to check it and decide.")}
        icon="list"
        actions={
          <>
            <Button variant="outline" asChild>
              <a href={`/api/registration/export${exportQuery}`}>
                <FileSpreadsheet /> {t("Excel")}
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/admin/registrations/print${exportQuery}`}>
                <Printer /> {t("PDF / print")}
              </Link>
            </Button>
          </>
        }
      />

      {demo && (
        <Alert className="mb-5 border-info-foreground/20 bg-info">
          <Info />
          <AlertTitle>{t("Demonstration data")}</AlertTitle>
          <AlertDescription>{t("No database is connected, so sample registrations are shown. They disappear as soon as a delegation saves a real one.")}</AlertDescription>
        </Alert>
      )}

      <nav aria-label={t("Status")} className="-mx-4 mb-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <ul className="flex w-max gap-1 rounded-lg border bg-card p-1 md:w-auto md:flex-wrap">
          {tabs.map((tab) => {
            const count = scoped.filter((person) => matchesStatus(person, tab.value)).length;
            const active = filter.status === tab.value;
            return (
              <li key={tab.value || "all"}>
                <Link
                  href={hrefFor(tab.value)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors",
                    active ? "bg-sidebar text-sidebar-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {t(tab.label)}
                  <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "bg-muted")}>{count}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mb-5">
        <FilterBar
          values={filter}
          status={filter.status}
          countries={countries.map((item) => ({ value: item.code, label: countryName(item.code, locale) }))}
          sports={sports.map((item) => ({ value: item.id, label: sportName(item.id, locale) }))}
          clearHref={hasFilter ? hrefFor(filter.status) : undefined}
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="list" title={hasFilter || filter.status ? t("No registrations match") : t("No registrations yet")}>
          {hasFilter || filter.status ? t("Try another status or clear the filters.") : t("Records appear here as soon as a delegation officer saves one.")}
        </EmptyState>
      ) : (
        <>
          <p className="mb-2 text-xs text-muted-foreground">
            {queueFirst ? t("{n} records · oldest submission first", { n: rows.length }) : t("{n} records · most recent change first", { n: rows.length })}
          </p>
          <ItemList rows={rows} label={t("Registrations")} editLabel="Review" />
        </>
      )}
      <MobileBarSpacer />
    </>
  );
}
