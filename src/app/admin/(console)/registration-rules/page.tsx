import { sports } from "@/data/sports";
import { saveRegistrationRulesForm } from "@/app/admin/actions/registration-rules";
import { PageHeader, MobileBarSpacer } from "@/components/admin/page-header";
import { Button } from "@/components/admin/ui/button";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { pick } from "@/lib/i18n/config";
import { loadRegistrationRules } from "@/lib/registration/settings";
import { getStore } from "@/lib/store";

const extras = [
  ["eligibility", "Sports eligibility confirmation"],
  ["medical", "Medical fitness certificate"],
  ["other", "Other documents"],
] as const;

export default async function RegistrationRulesPage({ searchParams }: { searchParams: Promise<{ saved?: string; readonly?: string }> }) {
  await requireUser("registrations");
  const query = await searchParams;
  const locale = await getAdminLocale();
  const t = translator(locale);
  const rules = await loadRegistrationRules();
  const writable = getStore().writable;
  return (
    <>
      <PageHeader
        title={t("Quotas and documents")}
        description={t("Passport, photograph and a guardian authorisation for minors are always required. Tick any further document, and set the quota each country may submit.")}
        icon="check"
      />
      {query.saved && <p className="mb-4 text-sm">{t("Saved.")}</p>}
      {(!writable || query.readonly) && <p className="mb-4 text-sm">{t("This deployment cannot store registrations until a database is connected.")}</p>}
      <form action={saveRegistrationRulesForm} className="flex max-w-3xl flex-col gap-8">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold">{t("Also require these documents")}</legend>
          {extras.map(([kind, label]) => (
            <label key={kind} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="extra" value={kind} defaultChecked={rules.extraRequired.includes(kind)} />
              {t(label)}
            </label>
          ))}
        </fieldset>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-3 font-semibold">{t("Sport")}</th>
                <th className="px-2 font-semibold">{t("Men")}</th>
                <th className="px-2 font-semibold">{t("Women")}</th>
                <th className="px-2 font-semibold">{t("Officials")}</th>
                <th className="px-2 font-semibold">{t("Judges")}</th>
              </tr>
            </thead>
            <tbody>
              {sports.map((sport) => {
                const current = rules.quotas[sport.id] ?? sport.programme?.quota;
                const cell = (group: "men" | "women" | "staff" | "judges") => (
                  <input
                    name={`${sport.id}-${group}`}
                    type="number"
                    min={0}
                    defaultValue={current?.[group] ?? 0}
                    className="h-9 w-20 rounded-md border bg-background px-2"
                  />
                );
                return (
                  <tr key={sport.id} className="border-b">
                    <th className="py-2 pr-3 text-left font-medium">{pick(sport.name, locale)}</th>
                    <td className="px-2 py-2">{cell("men")}</td>
                    <td className="px-2 py-2">{cell("women")}</td>
                    <td className="px-2 py-2">{cell("staff")}</td>
                    <td className="px-2 py-2">{cell("judges")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="m-0 text-sm text-muted-foreground">{t("These numbers start from the provisional programme. Saving replaces them for every country.")}</p>
        <Button type="submit" disabled={!writable}>
          {t("Save")}
        </Button>
      </form>
      <MobileBarSpacer />
    </>
  );
}
