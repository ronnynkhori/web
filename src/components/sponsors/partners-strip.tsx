import Image from "next/image";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { pick, type Locale } from "@/lib/i18n/config";
import { featuredTiers, sponsorTiers } from "@/data/sponsors";
import { getSponsors } from "@/lib/cms/read";

/** Slim band near the top of the home page: the institutional partner and the official agency. */
export async function PartnersStrip({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const sponsors = await getSponsors();
  const featured = sponsorTiers.filter((t) => featuredTiers.has(t.id)).flatMap((t) => sponsors.filter((p) => p.tier === t.id && p.logo));
  if (featured.length === 0) return null;
  return (
    <section aria-label={dict.sponsors.title} data-theme="light" className="border-y border-line bg-surface text-fg">
      <ul className="container-page m-0 grid list-none items-center gap-x-8 gap-y-5 py-6 tablet:grid-cols-2 tablet:divide-x tablet:divide-line">
        {featured.map((p) => {
          const logo = p.logo!;
          const img = (
            <Image
              src={logo.src}
              alt={logo.alt ? pick(logo.alt, locale) : p.name}
              width={logo.width}
              height={logo.height}
              sizes="16rem"
              className="h-[clamp(2.5rem,2rem+1.2vw,3.25rem)] w-auto"
            />
          );
          return (
            <li key={p.id} className="flex flex-col items-center gap-3 text-center tablet:px-6">
              <span className="type-overline text-fg-2">{dict.sponsors.tiers[p.tier]}</span>
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex">
                  {img}
                </a>
              ) : (
                img
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
