import type { ReactNode } from "react";
import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { pick, type Locale } from "@/lib/i18n/config";
import { featuredTiers, sponsorTiers } from "@/data/sponsors";
import { getSponsors } from "@/lib/cms/read";
import type { SponsorDoc } from "@/lib/cms/types";
import { reveal } from "@/lib/animation/reveal";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";

function PartnerLogo({ partner, locale, sizes }: { partner: SponsorDoc; locale: Locale; sizes: string }) {
  if (!partner.logo) return <span className="type-label">{partner.name}</span>;
  return (
    <Image
      src={partner.logo.src}
      alt={partner.logo.alt ? pick(partner.logo.alt, locale) : partner.name}
      width={partner.logo.width}
      height={partner.logo.height}
      sizes={sizes}
      unoptimized={partner.logo.src.toLowerCase().endsWith(".svg")}
      className="max-h-full w-auto object-contain"
    />
  );
}

function PartnerLink({ partner, className, children }: { partner: SponsorDoc; className: string; children: ReactNode }) {
  return partner.url ? (
    <a href={partner.url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );
}

/**
 * Partners (#partners): the institutional partner and the official agency as
 * two large cards, then any sponsor tiers added in the Control Room. No
 * partners, no section.
 */
export async function SponsorsSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const s = dict.sponsors;
  const sponsors = await getSponsors();
  if (sponsors.length === 0) return null;
  const featured = sponsorTiers.filter((t) => featuredTiers.has(t.id)).flatMap((t) => sponsors.filter((p) => p.tier === t.id));
  return (
    <Section id="partners" labelledBy="partners-title" theme="light">
      <SectionHeader id="partners-title" overline={s.overline} title={s.title} />
      <div className="flex flex-col gap-7">
        {featured.length > 0 && (
          <ul className="m-0 grid list-none gap-4 p-0 tablet:grid-cols-2">
            {featured.map((p, i) => (
              <li key={p.id} className="flex flex-col gap-3" {...reveal("fade-up", i)}>
                <h3 className="m-0 type-overline text-fg-2">{s.tiers[p.tier]}</h3>
                <PartnerLink
                  partner={p}
                  className="relative grid h-[clamp(7.5rem,6rem+4vw,10rem)] place-items-center overflow-hidden rounded-md border border-line bg-[#fff] px-6 py-5 transition-shadow duration-ui hover:shadow-[0_18px_40px_-24px_rgb(10_42_102/0.5)] tablet:px-8"
                >
                  <PartnerLogo partner={p} locale={locale} sizes="(min-width: 40rem) 24rem, 80vw" />
                  <span aria-hidden="true" className="torch-stripe absolute inset-x-0 bottom-0 h-1" />
                </PartnerLink>
              </li>
            ))}
          </ul>
        )}
        {sponsorTiers
          .filter((tier) => !featuredTiers.has(tier.id))
          .map((tier) => {
            const partners = sponsors.filter((p) => p.tier === tier.id);
            if (partners.length === 0) return null;
            const height = tier.id === "principal" ? "h-9" : "h-8";
            return (
              <div key={tier.id}>
                <h3 className="m-0 mb-4 type-overline text-fg-2">{s.tiers[tier.id]}</h3>
                <ul
                  className={cn(
                    "m-0 grid list-none gap-3 p-0",
                    tier.id === "principal" ? "grid-cols-1 tablet:grid-cols-3" : "grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-6",
                  )}
                >
                  {partners.map((p) => (
                    <li key={p.id} className={cn("rounded-sm border border-line bg-surface p-3", height)}>
                      <PartnerLink partner={p} className="grid h-full place-items-center">
                        <PartnerLogo partner={p} locale={locale} sizes="12rem" />
                      </PartnerLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        <Button href={`/${locale}/contact`} variant="ghost" icon="arrow-right" className="self-start">
          {s.cta}
        </Button>
      </div>
    </Section>
  );
}
