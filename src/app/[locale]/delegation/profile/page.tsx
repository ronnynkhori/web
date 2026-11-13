import { notFound } from "next/navigation";
import { sports } from "@/data/sports";
import { ProfileForm } from "@/components/registration/profile-form";
import { isLocale, pick } from "@/lib/i18n/config";
import { delegationContext } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";

export default async function DelegationProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { delegation } = await delegationContext(locale);
  const copy = regCopy(locale);
  return (
    <section className="container-wide flex flex-col gap-4 py-8">
      <h1 className="m-0 type-display-m">{copy.profile}</h1>
      <ProfileForm
        locale={locale}
        delegation={delegation}
        sports={sports.map((sport) => ({ id: sport.id, name: pick(sport.name, locale) }))}
      />
    </section>
  );
}
