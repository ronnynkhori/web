import { notFound } from "next/navigation";
import { PageTitle } from "@/components/registration/portal/page-title";
import { ParticipantForm } from "@/components/registration/participant-form";
import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import { isLocale, pick } from "@/lib/i18n/config";
import { delegationContext } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { emptyParticipant, type ParticipantKind } from "@/lib/registration/model";
import { portalCopy } from "@/lib/registration/portal-copy";
import { loadRegistrationRules } from "@/lib/registration/settings";

export default async function NewParticipantPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ kind?: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { kind: requested } = await searchParams;
  const kind: ParticipantKind = requested === "official" ? "official" : "athlete";
  const [{ session, delegation }, rules] = await Promise.all([delegationContext(locale), loadRegistrationRules()]);
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  const entered = delegation?.sports.length ? sports.filter((sport) => delegation.sports.includes(sport.id)) : sports;
  return (
    <div className="container-page flex flex-col gap-6 py-6 tablet:py-7">
      <PageTitle back={{ href: `/${locale}/delegation`, label: p.back }} title={kind === "athlete" ? copy.newAthlete : copy.newOfficial} />
      <ParticipantForm
        locale={locale}
        kind={kind}
        person={emptyParticipant(session.countryCode, kind)}
        sports={entered.map((sport) => ({ id: sport.id, name: pick(sport.name, locale) }))}
        files={[]}
        extraRequired={rules.extraRequired}
        countryName={pick(countries.find((item) => item.code === session.countryCode)?.name ?? { en: session.countryCode, pt: session.countryCode }, locale)}
      />
    </div>
  );
}
