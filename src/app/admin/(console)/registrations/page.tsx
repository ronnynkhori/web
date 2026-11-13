import Link from "next/link";
import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import { ItemList, type ListRow } from "@/components/admin/item-list";
import { PageHeader, MobileBarSpacer } from "@/components/admin/page-header";
import { Button } from "@/components/admin/ui/button";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { pick } from "@/lib/i18n/config";
import { loadParticipants } from "@/lib/registration/data";
import type { RegistrationStatus } from "@/lib/registration/model";

const statuses: RegistrationStatus[] = ["draft", "submitted", "review", "correction", "approved", "rejected"];

const tone = {
  draft: "neutral",
  submitted: "info",
  review: "warning",
  correction: "warning",
  approved: "success",
  rejected: "error",
} as const;

const statusLabel: Record<RegistrationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  review: "Under review",
  correction: "Needs correction",
  approved: "Approved",
  rejected: "Rejected",
};

export default async function RegistrationsPage({ searchParams }: { searchParams: Promise<{ country?: string; status?: string; saved?: string }> }) {
  await requireUser("registrations");
  const query = await searchParams;
  const locale = await getAdminLocale();
  const t = translator(locale);
  const country = query.country ?? "";
  const status = statuses.includes(query.status as RegistrationStatus) ? (query.status as RegistrationStatus) : "";
  let people = await loadParticipants();
  if (country) people = people.filter((person) => person.countryCode === country);
  if (status) people = people.filter((person) => person.status === status);
  const countryName = (code: string) => pick(countries.find((item) => item.code === code)?.name ?? { en: code, pt: code }, locale);
  const sportName = (id: string) => pick(sports.find((item) => item.id === id)?.name ?? { en: id, pt: id }, locale);
  const rows: ListRow[] = people.map((person) => ({
    id: person.id,
    href: `/admin/registrations/${person.id}`,
    title: person.fullName || "—",
    subtitle: [countryName(person.countryCode), person.sportId ? sportName(person.sportId) : "", person.registrationNumber].filter(Boolean).join(" · "),
    badges: [
      { label: t(statusLabel[person.status]), tone: tone[person.status] },
      { label: person.kind === "athlete" ? t("Athlete") : t("Official"), tone: "neutral" },
    ],
  }));
  const exportHref = country ? `/api/registration/export?country=${country}` : "/api/registration/export";
  return (
    <>
      <PageHeader
        title={t("Registrations")}
        description={t("Review delegation athletes and officials. Age bands and quotas follow the provisional programme.")}
        icon="list"
        actions={
          <Button variant="outline" asChild>
            <a href={exportHref}>{t("Export Excel")}</a>
          </Button>
        }
      />
      {query.saved && <p className="mb-4 text-sm">{t("Saved.")}</p>}
      <form className="mb-4 flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("Country")}
          <select name="country" defaultValue={country} className="h-11 rounded-md border bg-background px-3 text-sm md:h-9">
            <option value="">{t("All countries")}</option>
            {countries.map((item) => (
              <option key={item.code} value={item.code}>
                {pick(item.name, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {t("Status")}
          <select name="status" defaultValue={status} className="h-11 rounded-md border bg-background px-3 text-sm md:h-9">
            <option value="">{t("All")}</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {t(statusLabel[item])}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" variant="secondary">
          {t("Filter")}
        </Button>
        {(country || status) && (
          <Link href="/admin/registrations" className="text-sm underline">
            {t("Clear")}
          </Link>
        )}
      </form>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("No registrations match this filter.")}</p>
      ) : (
        <ItemList rows={rows} label={t("Registrations")} />
      )}
      <MobileBarSpacer />
    </>
  );
}
