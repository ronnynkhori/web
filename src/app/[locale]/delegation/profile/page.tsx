import { notFound } from "next/navigation";
import { PageTitle } from "@/components/registration/portal/page-title";
import { ProfileForm } from "@/components/registration/profile-form";
import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import { isLocale, pick } from "@/lib/i18n/config";
import { delegationContext } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { portalCopy } from "@/lib/registration/portal-copy";

export default async function DelegationProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { delegation, session } = await delegationContext(locale);
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  return (
    <div className="container-page flex flex-col gap-6 py-6 tablet:py-7">
      <PageTitle back={{ href: `/${locale}/delegation`, label: p.back }} title={copy.profile} />
      <ProfileForm
        locale={locale}
        delegation={delegation}
        countryName={pick(countries.find((item) => item.code === session.countryCode)?.name ?? { en: session.countryCode, pt: session.countryCode }, locale)}
        sports={sports.map((sport) => ({ id: sport.id, name: pick(sport.name, locale) }))}
      />
    </div>
  );
}
