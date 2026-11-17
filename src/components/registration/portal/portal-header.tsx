import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { countries } from "@/data/countries";
import { pick, type Locale } from "@/lib/i18n/config";
import { signOutDelegation } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { portalCopy } from "@/lib/registration/portal-copy";
import { PortalNav } from "./portal-nav";

/** Navy delegation banner with the country, the officer and the portal tabs. Sits under the site header. */
export function PortalHeader({ locale, countryCode, officerName, institution }: { locale: Locale; countryCode: string; officerName: string; institution?: string }) {
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  const country = countries.find((item) => item.code === countryCode);
  const base = `/${locale}/delegation`;
  return (
    <div data-theme="dark" className="relative border-b border-line bg-surface text-fg print:hidden">
      <div aria-hidden="true" className="torch-stripe absolute inset-x-0 top-0 h-1" />
      <div className="container-wide flex flex-col gap-4 pt-5 tablet:pt-6">
        <div className="flex flex-wrap items-center gap-4">
          {country?.flag && (
            <Image src={country.flag.src} alt="" width={96} height={64} className="h-12 w-[4.5rem] shrink-0 rounded-xs object-cover ring-1 ring-line tablet:h-14 tablet:w-[5.25rem]" />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="m-0 type-overline text-accent">{p.portal}</p>
            <p className="m-0 font-display text-2xl leading-none uppercase tablet:text-3xl">{country ? pick(country.name, locale) : countryCode}</p>
            <p className="m-0 truncate type-caption text-fg-2">
              {institution ? `${institution} · ` : ""}
              {p.signedInAs} {officerName}
            </p>
          </div>
          <div className="flex w-full items-center gap-2 tablet:w-auto">
            <a
              href={`${base}/participants/new?kind=athlete`}
              className="hover-overlay press inline-flex flex-1 justify-center tablet:flex-none min-h-touch items-center gap-2 rounded-xs bg-action-secondary px-4 type-label text-on-action-secondary"
            >
              <Icon name="star" size={16} /> {copy.newAthlete}
            </a>
            <a
              href={`${base}/participants/new?kind=official`}
              className="hover-overlay press hidden min-h-touch items-center gap-2 rounded-xs border-2 border-action-ghost-border px-4 type-label text-fg tablet:inline-flex"
            >
              <Icon name="id" size={16} /> {copy.newOfficial}
            </a>
            <form action={signOutDelegation}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className="inline-flex min-h-touch items-center gap-2 px-2 type-label text-fg-2 hover:text-fg" aria-label={copy.signOut}>
                <Icon name="arrow-right" size={16} />
                <span className="max-tablet:sr-only">{copy.signOut}</span>
              </button>
            </form>
          </div>
        </div>
        <PortalNav
          label={p.portal}
          links={[
            { href: base, label: copy.dashboard, icon: "grid", exact: true },
            { href: `${base}/participants`, label: p.people, icon: "list" },
            { href: `${base}/profile`, label: copy.profile, icon: "flag" },
            { href: `${base}/print`, label: p.exports, icon: "download" },
          ]}
        />
      </div>
    </div>
  );
}
