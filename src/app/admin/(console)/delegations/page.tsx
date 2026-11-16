import { MobileBarSpacer, PageHeader } from "@/components/admin/page-header";
import { CountryTable } from "@/components/admin/registration/country-table";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { loadItems } from "@/lib/admin/mutate";
import type { UserDoc } from "@/lib/cms/types";
import { can } from "@/lib/admin/roles";
import { loadDelegations, loadParticipants } from "@/lib/registration/data";
import { countryProgress } from "@/lib/registration/review";

export const metadata = { title: "Delegações" };

export default async function DelegationsPage() {
  const session = await requireUser("registrations");
  const locale = await getAdminLocale();
  const t = translator(locale);
  const [people, delegations, users] = await Promise.all([loadParticipants(), loadDelegations(), loadItems<UserDoc>("users").catch(() => [])]);
  const rows = countryProgress(people, delegations, users.filter((user) => user.active));
  const ready = rows.filter((row) => row.officer && row.delegation).length;
  return (
    <>
      <PageHeader
        title={t("Delegations")}
        description={t("The nine CPLP countries: whether each has an officer and a delegation profile, and how far its registrations have gone. {ready} of 9 are fully set up.", { ready })}
        icon="globe"
      />
      <CountryTable rows={rows} locale={locale} t={t} canManageUsers={can(session.role, "users")} />
      <MobileBarSpacer />
    </>
  );
}
