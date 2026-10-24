import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { pick, type Locale } from "@/lib/i18n/config";
import { gamesDays, storyBeats } from "@/data/event";
import { sports } from "@/data/sports";
import { getCountries } from "@/lib/cms/read";
import { reveal } from "@/lib/animation/reveal";
import { Stat, StatGroup } from "@/components/ui/stat";
import { SectionHeader } from "@/components/ui/section-header";
import { StoryMosaic } from "./story-mosaic";
import { StoryPanels, type StoryBeatView } from "./story-panels";

/**
 * "The Games" - light editorial header, the dark story stage (stacked panels
 * below desktop, an editorial mosaic on desktop), then
 * divided stats. Figures are derived from the data files.
 */
export async function GamesSection({ dict, locale, compact }: { dict: Dictionary; locale: Locale; compact?: boolean }) {
  const g = dict.games;
  const countries = await getCountries();
  const stats = [
    { key: "days", value: gamesDays, label: g.stats.days, note: g.statNotes.days },
    { key: "sports", value: sports.length, label: g.stats.sports, note: g.statNotes.sports },
    { key: "countries", value: countries.length, label: g.stats.countries, note: g.statNotes.countries },
  ];
  const nationsFact = String(countries.length);
  const beats: StoryBeatView[] = storyBeats.map((b) => ({
    id: b.id,
    kicker: pick(b.kicker, locale),
    headline: pick(b.headline, locale),
    body: pick(b.body, locale),
    tone: b.tone,
    image: b.image,
    imageAlt: b.image ? pick(b.image.alt, locale) : undefined,
    // A place label on a stand-in photo would claim it shows that place.
    place: b.place && !b.image?.isDemo ? pick(b.place, locale) : undefined,
    facts: b.facts?.map((f) => ({
      value: f.label.en.startsWith("nations") ? nationsFact : pick(f.value, locale),
      label: pick(f.label, locale),
    })),
  }));
  const storyLabels = { list: g.progress, photo: dict.sports.photoRequired };

  return (
    <section id="games" aria-labelledby="games-title" className="section-anchor relative bg-surface text-fg">
      <div className="container-page section-y pb-7! desktop:pb-8!">
        <SectionHeader id="games-title" overline={g.overline} title={g.title} titleAccent={g.titleAccent} intro={g.intro} />
      </div>

      <StoryPanels beats={beats} labels={storyLabels} compact={compact} className="desktop:hidden" />
      <StoryMosaic beats={beats} labels={storyLabels} className="hidden desktop:block" />

      <div className="container-page section-y pt-7! desktop:pt-8!">
        <StatGroup className="grid-cols-3 border-t border-line">
          {stats.map((s, i) => (
            <Stat
              key={s.key}
              value={s.value}
              label={s.label}
              size="l"
              countUp
              locale={locale}
              valueClassName="text-accent"
              className="border-r border-line py-5 pr-3 pl-3 first:pl-0 last:border-r-0 tablet:px-5 tablet:first:pl-0"
              {...reveal("fade-up", i)}
            >
              <dd className="order-4 m-0 hidden type-body-s text-fg-muted tablet:block">{s.note}</dd>
            </Stat>
          ))}
        </StatGroup>
      </div>
    </section>
  );
}
