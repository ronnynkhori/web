import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { sponsorTiers } from "@/data/sponsors";
import { getSponsors } from "@/lib/cms/read";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";

/** Partners (#partners). Only tiers with partners added in the Control Room are shown; no partners, no section. */
export async function SponsorsSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const s = dict.sponsors;
  const sponsors = await getSponsors();
  if (sponsors.length === 0) return null;
  return (
    <Section id="partners" labelledBy="partners-title">
      <SectionHeader id="partners-title" overline={s.overline} title={s.title} />
      <div className="flex flex-col gap-7">
        {sponsorTiers.map((tier) => {
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
                {partners.map((p) => {
                  const logo = p.logo ? (
                    <Image
                      src={p.logo.src}
                      alt={p.name}
                      width={p.logo.width}
                      height={p.logo.height}
                      sizes="12rem"
                      unoptimized={p.logo.src.toLowerCase().endsWith(".svg")}
                      className="max-h-full w-auto object-contain"
                    />
                  ) : (
                    <span className="type-label">{p.name}</span>
                  );
                  return (
                    <li key={p.id} className={cn("grid place-items-center rounded-sm border border-line bg-surface p-3", height)}>
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="grid h-full place-items-center">
                          {logo}
                        </a>
                      ) : (
                        logo
                      )}
                    </li>
                  );
                })}
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
