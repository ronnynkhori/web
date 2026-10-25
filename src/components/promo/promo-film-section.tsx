import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { reveal } from "@/lib/animation/reveal";
import { PromoFilm } from "./promo-film";

/** The official promo film and its song, right after the hero. */
export function PromoFilmSection({ dict }: { dict: Dictionary }) {
  const f = dict.promoFilm;
  return (
    <Section
      id="film"
      labelledBy="film-title"
      theme="light"
      band="alt"
      className="section-anchor"
      containerClassName="desktop:grid desktop:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)] desktop:items-center desktop:gap-8"
    >
      <SectionHeader id="film-title" overline={f.overline} title={f.title} titleAccent={f.titleAccent} intro={f.intro} className="desktop:mb-0!" />
      <div {...reveal("fade-up", 2)}>
        <PromoFilm labels={{ play: f.play, duration: f.duration, sound: f.sound, title: f.videoLabel }} />
        <span aria-hidden="true" className="torch-stripe block h-2 w-full rounded-b-md" />
        <p className="m-0 mt-3 type-caption text-fg-muted">{f.caption}</p>
      </div>
    </Section>
  );
}
