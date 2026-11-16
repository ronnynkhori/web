import Image from "next/image";
import { PageHeader } from "@/components/admin/page-header";
import { PrintNow } from "@/components/admin/registration/print-now";
import { byQueue, countryName, sportName, statusLabel } from "@/components/admin/registration/meta";
import { stampFormatFor } from "@/components/admin/time";
import { countries } from "@/data/countries";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { regCopy } from "@/lib/registration/copy";
import { applyFilter, filterQuery, readFilter } from "@/lib/registration/filter";
import { loadParticipants } from "@/lib/registration/data";

export const metadata = { title: "PDF" };

/** Printable registration list (the browser's "Save as PDF" makes the PDF export), grouped by country. */
export default async function PrintRegistrationsPage({ searchParams }: PageProps<"/admin/registrations/print">) {
  const session = await requireUser("registrations");
  const query = await searchParams;
  const locale = await getAdminLocale();
  const t = translator(locale);
  const copy = regCopy(locale);
  const filter = readFilter((name) => {
    const value = query[name];
    return Array.isArray(value) ? value[0] : value;
  });
  const people = applyFilter(await loadParticipants(), filter).sort(byQueue);
  const groups = countries.map((country) => ({ code: country.code, people: people.filter((person) => person.countryCode === country.code) })).filter((group) => group.people.length);
  const scope = [
    filter.country && countryName(filter.country, locale),
    filter.sport && sportName(filter.sport, locale),
    filter.kind && (filter.kind === "athlete" ? t("Athletes") : t("Officials")),
    filter.status && (filter.status === "waiting" ? t("Waiting for review") : t(statusLabel[filter.status])),
    filter.q && `“${filter.q}”`,
  ].filter(Boolean);

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title={t("Print registration list")}
          back={{ href: `/admin/registrations${filterQuery(filter)}`, label: t("Registrations") }}
          description={t("Choose “Save as PDF” in the print window to get a PDF. The list follows the filters you had on the Registrations page.")}
          actions={<PrintNow />}
        />
      </div>
      <article className="rounded-xl border bg-card p-6 shadow-xs print:border-0 print:p-0 print:shadow-none">
        <header className="mb-6 flex items-center justify-between gap-6 border-b-4 border-[var(--tk-color-brand-navy)] pb-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">XIII Jogos Desportivos da CPLP · Angola 2027</p>
            <h1 className="font-display text-3xl tracking-wide">{t("Delegation registrations")}</h1>
            <p className="text-sm text-muted-foreground">
              {scope.length ? scope.join(" · ") : t("All registrations")} · {t("{n} people", { n: people.length })}
            </p>
          </div>
          <Image src="/images/brand/cplp-emblem.png" alt="" width={512} height={512} className="size-16" />
        </header>
        {groups.length === 0 && <p className="text-sm text-muted-foreground">{t("No registrations match")}</p>}
        {groups.map((group) => (
          <section key={group.code} className="mb-8 break-inside-avoid-page">
            <h2 className="mb-2 text-base font-bold">
              {countryName(group.code, locale)} <span className="font-normal text-muted-foreground">· {group.people.length}</span>
            </h2>
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b-2 border-foreground/70">
                  {[copy.registrationNumber, copy.fullName, copy.kind, t("Sport or function"), copy.dateOfBirth, copy.documentNumber, copy.statusLabel].map((heading) => (
                    <th key={heading} className="py-1.5 pr-3 font-semibold">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.people.map((person) => (
                  <tr key={person.id} className="border-b break-inside-avoid">
                    <td className="py-1.5 pr-3 font-mono">{person.registrationNumber || "—"}</td>
                    <td className="py-1.5 pr-3 font-semibold">{person.fullName}</td>
                    <td className="py-1.5 pr-3">{person.kind === "athlete" ? copy.athlete : copy.official}</td>
                    <td className="py-1.5 pr-3">
                      {person.kind === "athlete" ? [sportName(person.sportId, locale), person.discipline !== "—" ? person.discipline : ""].filter(Boolean).join(" · ") : [person.function ? copy.functions[person.function] : "", sportName(person.sportId, locale)].filter(Boolean).join(" · ")}
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">{person.dateOfBirth}</td>
                    <td className="py-1.5 pr-3 font-mono">{person.documentNumber}</td>
                    <td className="py-1.5">{t(statusLabel[person.status])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
        <footer className="mt-6 border-t pt-3 text-[10px] text-muted-foreground">
          {t("Generated {when} by {name}. Contains personal data: keep it confidential and destroy printed copies after use.", { when: stampFormatFor(locale).format(new Date()), name: session.name })}
        </footer>
      </article>
    </>
  );
}
