import { notFound } from "next/navigation";
import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import { ParticipantForm } from "@/components/registration/participant-form";
import { isLocale, pick } from "@/lib/i18n/config";
import { delegationContext } from "@/lib/registration/actions";
import { emptyParticipant, type ParticipantKind } from "@/lib/registration/model";
import { regCopy } from "@/lib/registration/copy";

export default async function NewParticipantPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ kind?: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { kind: requested } = await searchParams;
  const kind: ParticipantKind = requested === "official" ? "official" : "athlete";
  const { session } = await delegationContext(locale);
  const copy = regCopy(locale);
  return (
    <section className="container-wide flex flex-col gap-4 py-8">
      <h1 className="m-0 type-display-m">{kind === "athlete" ? copy.newAthlete : copy.newOfficial}</h1>
      <ParticipantForm
        locale={locale}
        kind={kind}
        person={emptyParticipant(session.countryCode, kind)}
        sports={sports.map((sport) => ({ id: sport.id, name: pick(sport.name, locale) }))}
        files={[]}
        countryName={pick(countries.find((item) => item.code === session.countryCode)?.name ?? { en: session.countryCode, pt: session.countryCode }, locale)}
      />
    </section>
  );
}
