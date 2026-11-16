import Image from "next/image";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { PrintButton } from "@/components/registration/print-button";
import { PageTitle } from "@/components/registration/portal/page-title";
import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import { isLocale, pick } from "@/lib/i18n/config";
import { delegationContext } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { fillCopy, portalCopy } from "@/lib/registration/portal-copy";

export default async function PrintListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { people, delegation, session } = await delegationContext(locale);
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  const country = pick(countries.find((item) => item.code === session.countryCode)?.name ?? { en: session.countryCode, pt: session.countryCode }, locale);
  const sorted = [...people].sort((a, b) => a.kind.localeCompare(b.kind) || a.fullName.localeCompare(b.fullName));
  const when = new Intl.DateTimeFormat(locale === "pt" ? "pt-PT" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Luanda" }).format(new Date());
  return (
    <div className="container-wide flex flex-col gap-6 py-6 tablet:py-7 print:py-0">
      <div className="print:hidden">
        <PageTitle
          back={{ href: `/${locale}/delegation`, label: p.back }}
          title={p.exports}
          actions={
            <>
              {/* A file download, so a plain link. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/api/registration/export" className="inline-flex min-h-touch items-center gap-2 rounded-xs border-2 border-action-ghost-border px-4 type-label text-fg">
                <Icon name="download" size={16} /> {copy.exportExcel}
              </a>
              <PrintButton label={copy.exportPdf} />
            </>
          }
        />
      </div>
      <article className="rounded-md border border-line bg-surface-raised p-5 shadow-sm tablet:p-6 print:border-0 print:p-0 print:shadow-none">
        <header className="mb-6 flex items-center justify-between gap-6 border-b-4 border-line-accent pb-4">
          <div className="flex flex-col gap-1">
            <p className="m-0 type-overline text-fg-muted">XIII Jogos Desportivos da CPLP · Angola 2027</p>
            <h1 className="m-0 type-heading-l">
              {p.printTitle} · {country}
            </h1>
            <p className="m-0 type-caption text-fg-muted">
              {delegation?.institution ? `${delegation.institution} · ` : ""}
              {fillCopy(p.printGenerated, { when })}
            </p>
          </div>
          <Image src="/images/brand/cplp-emblem.png" alt="" width={512} height={512} className="size-16" />
        </header>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left type-body-s">
            <thead>
              <tr className="border-b-2 border-line-strong">
                {[copy.registrationNumber, copy.fullName, copy.kind, copy.sport, copy.dateOfBirth, copy.statusLabel].map((heading) => (
                  <th key={heading} className="py-2 pr-4 type-caption font-bold whitespace-nowrap">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((person) => {
                const sport = sports.find((item) => item.id === person.sportId);
                return (
                  <tr key={person.id} className="border-b border-line break-inside-avoid">
                    <td className="py-2 pr-4 font-data whitespace-nowrap">{person.registrationNumber || "—"}</td>
                    <td className="py-2 pr-4 font-semibold">{person.fullName}</td>
                    <td className="py-2 pr-4">{person.kind === "athlete" ? copy.athlete : person.function ? copy.functions[person.function] : copy.official}</td>
                    <td className="py-2 pr-4">{sport ? pick(sport.name, locale) : "—"}</td>
                    <td className="py-2 pr-4 tabular whitespace-nowrap">{person.dateOfBirth}</td>
                    <td className="py-2">{copy.status[person.status]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}
