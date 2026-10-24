import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { pick, type Locale } from "@/lib/i18n/config";
import { getCountries, getCountryFlags } from "@/lib/cms/read";
import { sports } from "@/data/sports";
import { getLiveBaseline } from "@/lib/live/provider";
import type { Phase } from "@/lib/phase";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { GamesHub, type GamesHubProps } from "./games-hub";

/**
 * Games hub (#live, with #results and #medals inside). Directly under the hero
 * during and after the Games; a short "opens on 4 December" teaser before.
 */
export async function HubSection({ dict, locale, phase }: { dict: Dictionary; locale: Locale; phase: Phase }) {
  const h = dict.hub;

  if (phase === "pre") {
    return (
      <Section id="live" labelledBy="live-title" theme="dark" framed>
        <span id="results" className="sr-only" />
        <div className="flex flex-col gap-5 desktop:flex-row desktop:items-end desktop:justify-between">
          <div className="flex max-w-prose flex-col gap-3">
            <p className="m-0 type-overline">{h.overline}</p>
            <h2 id="live-title" className="m-0 type-display-m">
              {h.preTitle}
            </h2>
            <p className="m-0 type-body-l text-fg-2">{h.preBody}</p>
          </div>
          <Button href="#countdown" variant="secondary" icon="arrow-right" className="self-start desktop:self-end">
            {h.preCta}
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <Section id="live" labelledBy="live-title" theme="dark" framed className="scroll-mt-0">
      <SectionHeader
        id="live-title"
        overline={h.overline}
        title={phase === "post" ? h.postTitle : h.title}
        link={{ href: `/${locale}/results`, label: dict.pages.allResults }}
        className="mb-5! desktop:mb-7!"
      />
      <LiveHub dict={dict} locale={locale} phase={phase} />
    </Section>
  );
}

/** The live centre with its data loaded; also used on the results and sport pages. */
export async function LiveHub({
  dict,
  locale,
  phase,
  ...options
}: { dict: Dictionary; locale: Locale; phase: Phase } & Pick<GamesHubProps, "initialTab" | "initialSport" | "hideFollow">) {
  const [initial, nations, allFlags] = await Promise.all([getLiveBaseline(), getCountries(), getCountryFlags()]);
  return (
    <GamesHub
      initial={initial}
      phase={phase}
      locale={locale}
      nations={nations.map((c) => ({ code: c.code, name: pick(c.name, locale), flag: c.flag }))}
      allFlags={allFlags.map((c) => ({ code: c.code, name: pick(c.name, locale), flag: c.flag }))}
      sports={sports.map((s) => ({ id: s.id, name: pick(s.name, locale) }))}
      labels={{ hub: dict.hub, live: dict.live, results: dict.results, status: dict.status }}
      {...options}
    />
  );
}
