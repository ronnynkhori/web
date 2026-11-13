import { notFound } from "next/navigation";
import { sports } from "@/data/sports";
import { PrintButton } from "@/components/registration/print-button";
import { delegationContext } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { isLocale, pick } from "@/lib/i18n/config";

export default async function PrintListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { people, delegation } = await delegationContext(locale);
  const copy = regCopy(locale);
  return (
    <section className="container-wide py-8 print:py-0">
      <div className="mb-4 flex items-center justify-between gap-4 print:hidden">
        <a href={`/${locale}/delegation`} className="type-label text-link">
          {copy.back}
        </a>
        <PrintButton label={copy.exportPdf} />
      </div>
      <h1 className="type-display-m">{copy.title}</h1>
      <p className="type-body">{delegation?.institution}</p>
      <table className="w-full border-collapse text-left type-body-s">
        <thead>
          <tr>
            {[copy.registrationNumber, copy.fullName, copy.kind, copy.sport, copy.statusLabel].map((heading) => (
              <th key={heading} className="border-b border-line py-2 pr-3">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {people.map((person) => {
            const sport = sports.find((item) => item.id === person.sportId);
            return (
              <tr key={person.id}>
                <td className="border-b border-line py-2 pr-3">{person.registrationNumber}</td>
                <td className="border-b border-line py-2 pr-3">{person.fullName}</td>
                <td className="border-b border-line py-2 pr-3">{person.kind === "athlete" ? copy.athlete : copy.official}</td>
                <td className="border-b border-line py-2 pr-3">{sport ? pick(sport.name, locale) : person.sportId}</td>
                <td className="border-b border-line py-2">{copy.status[person.status]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
