import { notFound } from "next/navigation";
import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import { ParticipantForm } from "@/components/registration/participant-form";
import { isLocale, pick } from "@/lib/i18n/config";
import { delegationContext } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { canEdit } from "@/lib/registration/rules";

export default async function EditParticipantPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const { people, files } = await delegationContext(locale);
  const person = people.find((item) => item.id === id);
  if (!person) notFound();
  const copy = regCopy(locale);
  const query = await searchParams;
  return (
    <section className="container-wide flex flex-col gap-4 py-8">
      <h1 className="m-0 type-display-m">{person.fullName}</h1>
      <p className="m-0 type-label">
        {copy.status[person.status]}
        {person.registrationNumber ? ` · ${person.registrationNumber}` : ""}
      </p>
      {person.reviewNote && <p className="m-0 max-w-prose type-body">{person.reviewNote}</p>}
      {query.saved && <p className="m-0 type-body-s">{copy.saved}</p>}
      {person.status === "approved" && (
        <a className="type-label text-link" href={`/${locale}/delegation/participants/${person.id}/credential`}>
          {copy.credential}
        </a>
      )}
      {files.some((file) => file.participantId === person.id) && (
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {files
            .filter((file) => file.participantId === person.id)
            .map((file) => (
              <li key={file.id}>
                <a className="type-body-s text-link" href={`/api/registration/file/${file.id}`}>
                  {copy.files[file.kind]}: {file.filename}
                </a>
              </li>
            ))}
        </ul>
      )}
      {canEdit(person.status) ? (
        <ParticipantForm
          locale={locale}
          kind={person.kind}
          person={person}
          sports={sports.map((sport) => ({ id: sport.id, name: pick(sport.name, locale) }))}
          files={files.filter((file) => file.participantId === person.id)}
          countryName={pick(countries.find((item) => item.code === person.countryCode)?.name ?? { en: person.countryCode, pt: person.countryCode }, locale)}
        />
      ) : (
        <p className="m-0 type-body-s text-fg-muted">{copy.locked}</p>
      )}
    </section>
  );
}
