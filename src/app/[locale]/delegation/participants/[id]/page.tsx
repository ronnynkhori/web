import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { PageTitle } from "@/components/registration/portal/page-title";
import { StatusPill } from "@/components/registration/portal/status-pill";
import { ParticipantForm } from "@/components/registration/participant-form";
import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import { cn } from "@/lib/cn";
import { isLocale, pick } from "@/lib/i18n/config";
import { delegationContext } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { portalCopy } from "@/lib/registration/portal-copy";
import { canEdit } from "@/lib/registration/rules";
import { loadRegistrationRules } from "@/lib/registration/settings";

function Banner({ tone, icon, title, children }: { tone: "warn" | "error" | "success" | "info"; icon: "alert" | "close" | "check" | "clock"; title: string; children?: ReactNode }) {
  return (
    <div
      role={tone === "warn" || tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-4 rounded-md p-4 tablet:p-5",
        tone === "warn" && "bg-warning text-on-warning",
        tone === "error" && "bg-error text-on-error",
        tone === "success" && "bg-success text-on-success",
        tone === "info" && "border border-line bg-surface-raised text-fg",
      )}
    >
      <Icon name={icon} size={24} className="shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="m-0 type-body-m font-bold">{title}</p>
        {children}
      </div>
    </div>
  );
}

export default async function EditParticipantPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const [{ people, files, delegation }, rules] = await Promise.all([delegationContext(locale), loadRegistrationRules()]);
  const person = people.find((item) => item.id === id);
  if (!person) notFound();
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  const query = await searchParams;
  const mine = files.filter((file) => file.participantId === person.id);
  const sportName = (sid: string) => (sid ? pick(sports.find((sport) => sport.id === sid)?.name ?? { en: sid, pt: sid }, locale) : "");
  const entered = delegation?.sports.length ? sports.filter((sport) => delegation.sports.includes(sport.id) || sport.id === person.sportId) : sports;
  const country = pick(countries.find((item) => item.code === person.countryCode)?.name ?? { en: person.countryCode, pt: person.countryCode }, locale);

  const summary: [string, string][] = [
    [copy.dateOfBirth, person.dateOfBirth],
    [copy.nationality, person.nationality],
    [copy.documentNumber, person.documentNumber],
    [copy.documentExpiry, person.documentExpiry],
    [copy.sport, sportName(person.sportId)],
    person.kind === "athlete" ? [copy.discipline, person.discipline] : [copy.function, person.function ? copy.functions[person.function] : ""],
    [copy.federation, person.federation],
    [copy.guardianName, person.guardianName],
  ];

  return (
    <div className="container-page flex flex-col gap-6 py-6 tablet:py-7">
      <PageTitle
        back={{ href: `/${locale}/delegation/participants`, label: p.people }}
        title={person.fullName || "—"}
        meta={
          <>
            <StatusPill status={person.status} label={copy.status[person.status]} />
            <span className="type-body-s text-fg-2">
              {person.kind === "athlete" ? copy.athlete : copy.official} · {country}
            </span>
            {person.registrationNumber && <span className="rounded-xs bg-surface-inverse px-2 py-0.5 font-data type-caption font-bold tracking-wide text-fg-on-inverse">{person.registrationNumber}</span>}
          </>
        }
        actions={
          person.status === "approved" && (
            <a href={`/${locale}/delegation/participants/${person.id}/credential`} className="hover-overlay press inline-flex min-h-touch items-center gap-2 rounded-xs bg-action-secondary px-4 type-label text-on-action-secondary">
              <Icon name="id" size={16} /> {p.credentialOpen}
            </a>
          )
        }
      />

      {query.saved && (
        <p role="status" className="m-0 flex items-center gap-3 rounded-md bg-success px-4 py-3 type-body-s font-semibold text-on-success">
          <Icon name="check" size={20} /> {copy.saved}
        </p>
      )}
      {person.status === "correction" && (
        <Banner tone="warn" icon="alert" title={p.correctionTitle}>
          {person.reviewNote && <p className="m-0 type-body-m">“{person.reviewNote}”</p>}
        </Banner>
      )}
      {person.status === "rejected" && (
        <Banner tone="error" icon="close" title={p.rejectedTitle}>
          {person.reviewNote && <p className="m-0 type-body-m">“{person.reviewNote}”</p>}
        </Banner>
      )}
      {person.status === "approved" && (
        <Banner tone="success" icon="check" title={p.approvedTitle}>
          <p className="m-0 type-body-s">{p.approvedHelp}</p>
        </Banner>
      )}
      {(person.status === "submitted" || person.status === "review") && (
        <Banner tone="info" icon="clock" title={p.lockedTitle}>
          <p className="m-0 type-body-s text-fg-2">{copy.locked}</p>
        </Banner>
      )}

      {canEdit(person.status) ? (
        <ParticipantForm
          locale={locale}
          kind={person.kind}
          person={person}
          sports={entered.map((sport) => ({ id: sport.id, name: pick(sport.name, locale) }))}
          files={mine}
          extraRequired={rules.extraRequired}
          countryName={country}
        />
      ) : (
        <div className="grid gap-5 desktop:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="rounded-md border border-line bg-surface-raised p-5 tablet:p-6">
            <h2 className="m-0 mb-5 type-heading-s">{p.summary}</h2>
            <dl className="m-0 grid gap-x-6 gap-y-4 tablet:grid-cols-2">
              {summary
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <dt className="type-caption text-fg-muted">{label}</dt>
                    <dd className="m-0 type-body-m font-semibold">{value}</dd>
                  </div>
                ))}
            </dl>
          </section>
          <section className="rounded-md border border-line bg-surface-raised p-5">
            <h2 className="m-0 mb-4 type-heading-s">{copy.documents}</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {mine.map((file) => (
                <li key={file.id}>
                  <a href={`/api/registration/file/${file.id}`} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-sm border border-line p-3 hover:bg-surface-2">
                    <Icon name="check" size={16} className="text-fg-muted" />
                    <span className="flex min-w-0 flex-col">
                      <span className="type-body-s font-semibold">{copy.files[file.kind]}</span>
                      <span className="truncate type-caption text-fg-muted">{file.filename}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
