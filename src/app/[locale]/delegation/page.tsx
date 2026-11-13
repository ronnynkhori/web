import { notFound } from "next/navigation";
import { sports } from "@/data/sports";
import { ImportForm } from "@/components/registration/import-form";
import { isLocale, pick } from "@/lib/i18n/config";
import { delegationContext } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { summarise } from "@/lib/registration/rules";

export default async function DelegationHome({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ saved?: string; submitted?: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const copy = regCopy(locale);
  const { delegation, people, notices, writable } = await delegationContext(locale);
  const summary = summarise(people);
  const name = (id: string) => pick(sports.find((sport) => sport.id === id)?.name ?? { en: id, pt: id }, locale);
  const cards = [
    [copy.athletes, summary.athletes],
    [copy.officials, summary.officials],
    [copy.incomplete, summary.incomplete],
    [copy.submittedCount, summary.submitted],
    [copy.approved, summary.approved],
    [copy.correction, summary.correction],
  ] as const;
  return (
    <section className="container-wide flex flex-col gap-6 py-8">
      <h1 className="m-0 type-display-m">{copy.title}</h1>
      <p className="m-0 max-w-prose type-body-s text-fg-muted">{copy.provisional}</p>
      {!writable && <p className="m-0 type-body-s text-accent">{copy.readOnly}</p>}
      {query.saved && <p className="m-0 type-body-s">{copy.saved}</p>}
      {query.submitted && <p className="m-0 type-body-s">{copy.submitted}</p>}
      {!delegation && (
        <a href={`/${locale}/delegation/profile`} className="type-label text-link">
          {copy.profile}
        </a>
      )}
      <dl className="m-0 grid grid-cols-2 gap-3 tablet:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-sm border border-line p-4">
            <dt className="type-caption text-fg-muted">{label}</dt>
            <dd className="m-0 font-display text-2xl font-extrabold tabular">{value}</dd>
          </div>
        ))}
      </dl>
      <div>
        <h2 className="type-heading-s">{copy.bySport}</h2>
        {summary.bySport.length === 0 ? (
          <p className="type-body-s text-fg-muted">{copy.none}</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {summary.bySport.map((row) => (
              <li key={row.sportId} className="type-body">
                {name(row.sportId)} · {row.count}
              </li>
            ))}
          </ul>
        )}
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {people.map((person) => (
          <li key={person.id}>
            <a href={`/${locale}/delegation/participants/${person.id}`} className="type-body text-link">
              {person.fullName || "—"} · {copy.status[person.status]}
              {person.registrationNumber ? ` · ${person.registrationNumber}` : ""}
            </a>
          </li>
        ))}
      </ul>
      <div className="max-w-xl rounded-sm border border-line p-4">
        <h2 className="mt-0 type-heading-s">{copy.importTitle}</h2>
        <ImportForm locale={locale} />
      </div>
      {notices.length > 0 && (
        <div>
          <h2 className="type-heading-s">{copy.notices}</h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {notices.slice(0, 8).map((notice) => (
              <li key={notice.id} className="type-body-s">
                {copy.noticeLine(notice.participantName, notice.kind)}
                {notice.note ? ` ${notice.note}` : ""} {notice.emailed ? copy.noticeSent : copy.noticePending}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
