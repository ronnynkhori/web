import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { pick, type Locale } from "@/lib/i18n/config";
import { gamesDays, storyBeats } from "@/data/event";
import { sports } from "@/data/sports";
import { getCountries } from "@/lib/cms/read";
import { reveal } from "@/lib/animation/reveal";
import { Stat, StatGroup } from "@/components/ui/stat";
import { SectionHeader } from "@/components/ui/section-header";
import { ContentFlag } from "@/components/ui/content-flag";
import { cn } from "@/lib/cn";
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
  // Band order: nations, sports, continents, days, athletes; figures that the data files hold come from them.
  const fromData = [countries.length, sports.length, undefined, gamesDays, undefined];
  const stats = dict.stats.items.map((s, i) => ({ ...s, value: fromData[i] ?? s.value }));
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

      <div className="stats-band relative isolate overflow-hidden bg-band-highlight text-on-band-highlight">
        <div className="container-page pt-7 pb-[clamp(4.5rem,3rem+5vw,7.5rem)] tablet:pt-8">
          <p className="m-0 mb-6 flex flex-wrap items-center gap-3 type-overline">
            {dict.stats.overline}
            <ContentFlag>{dict.stats.flag}</ContentFlag>
          </p>
          <StatGroup className="grid-cols-2 gap-x-5 gap-y-7 tablet:grid-cols-5">
            {stats.map((s, i) => (
              <Stat
                key={s.label}
                value={s.value}
                prefix={"prefix" in s ? s.prefix : undefined}
                label={s.label}
                size="l"
                countUp
                locale={locale}
                valueClassName="stat-ribbon font-display"
                className={cn("border-l-2 border-current/20 pl-4", i === stats.length - 1 && "col-span-2 tablet:col-span-1")}
                {...reveal("fade-up", i)}
              />
            ))}
          </StatGroup>
        </div>
      </div>
    </section>
  );
}
