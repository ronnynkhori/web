import { notFound } from "next/navigation";
import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import { PageHeader, MobileBarSpacer } from "@/components/admin/page-header";
import { DecisionForm } from "@/components/registration/decision-form";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { pick } from "@/lib/i18n/config";
import { loadFiles, loadParticipants } from "@/lib/registration/data";
import { regCopy } from "@/lib/registration/copy";
import { canDecide } from "@/lib/registration/rules";

export default async function RegistrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("registrations");
  const { id } = await params;
  const locale = await getAdminLocale();
  const t = translator(locale);
  const copy = regCopy(locale);
  const person = (await loadParticipants()).find((item) => item.id === id);
  if (!person) notFound();
  const files = (await loadFiles()).filter((file) => file.participantId === person.id);
  const country = pick(countries.find((item) => item.code === person.countryCode)?.name ?? { en: person.countryCode, pt: person.countryCode }, locale);
  const sport = person.sportId ? pick(sports.find((item) => item.id === person.sportId)?.name ?? { en: person.sportId, pt: person.sportId }, locale) : "";
  const rows: [string, string][] = [
    [copy.kind, person.kind === "athlete" ? copy.athlete : copy.official],
    [copy.statusLabel, copy.status[person.status]],
    [t("Country"), country],
    [copy.fullName, person.fullName],
    [copy.dateOfBirth, person.dateOfBirth],
    [copy.sex, person.sex ? copy[person.sex] : ""],
    [copy.nationality, person.nationality],
    [copy.documentNumber, person.documentNumber],
    [copy.documentExpiry, person.documentExpiry],
    [copy.sport, sport],
    [copy.discipline, person.discipline],
    [copy.ageCategory, person.ageCategory],
    [copy.competitionCategory, person.competitionCategory],
    [copy.federation, person.federation],
    [copy.club, person.club],
    [copy.jersey, person.jerseyNumber],
    [copy.function, person.function ? copy.functions[person.function] : ""],
    [copy.functionOther, person.functionOther],
    [copy.contactEmail, person.contactEmail],
    [copy.contactPhone, person.contactPhone],
    [copy.emergencyName, person.emergencyName],
    [copy.emergencyPhone, person.emergencyPhone],
    [copy.accessibility, person.accessibility],
    [copy.guardianName, person.guardianName],
    [copy.guardianContact, person.guardianContact],
    [copy.registrationNumber, person.registrationNumber],
    [copy.reviewNote, person.reviewNote],
  ];
  const open = canDecide(person.status, "review");
  return (
    <>
      <PageHeader title={person.fullName || t("Registration")} back={{ href: "/admin/registrations", label: t("Registrations") }} icon="list" />
      <dl className="mb-8 grid max-w-3xl gap-3">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
              <dd className="text-sm">{value}</dd>
            </div>
          ))}
      </dl>
      <h2 className="mb-2 text-sm font-semibold">{copy.documents}</h2>
      {files.length === 0 ? (
        <p className="mb-8 text-sm text-muted-foreground">{t("No documents uploaded.")}</p>
      ) : (
        <ul className="mb-8 flex flex-col gap-2">
          {files.map((file) => (
            <li key={file.id}>
              <a className="text-sm underline" href={`/api/registration/file/${file.id}`}>
                {copy.files[file.kind]} — {file.filename}
              </a>
            </li>
          ))}
        </ul>
      )}
      {open ? <DecisionForm id={person.id} /> : <p className="text-sm text-muted-foreground">{t("This registration is not waiting for a decision.")}</p>}
      <MobileBarSpacer />
    </>
  );
}
