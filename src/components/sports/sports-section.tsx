import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { pick, type Locale } from "@/lib/i18n/config";
import { sports } from "@/data/sports";
import { SectionHeader } from "@/components/ui/section-header";
import type { Sport } from "@/data/types";
import type { SportView } from "./sport-card";
import { SportsGallery } from "./sports-gallery";

export function toSportView(sp: Sport, dict: Dictionary, locale: Locale): SportView {
  return {
    id: sp.id,
    name: pick(sp.name, locale),
    category: dict.sports.categories[sp.category],
    tone: sp.tone,
    image: sp.image,
    imageAlt: sp.image ? pick(sp.image.alt, locale) : undefined,
    mascot: sp.mascot,
    href: `/${locale}/sports/${sp.id}`,
  };
}

/** Sports - editorial section with the pinned horizontal gallery. Full-bleed track, so no Section container. */
export function SportsSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const s = dict.sports;
  return (
    <section id="sports" aria-labelledby="sports-title" className="relative overflow-x-clip bg-surface-2 text-fg section-y">
      <SportsGallery
        header={
          <SectionHeader
            id="sports-title"
            overline={s.overline}
            title={s.title}
            intro={s.intro}
            link={{ href: `/${locale}/sports`, label: dict.common.viewAll }}
          />
        }
        sports={sports.map((sp) => toSportView(sp, dict, locale))}
        labels={{ photo: s.photoRequired, hint: s.galleryHint }}
      />
    </section>
  );
}
