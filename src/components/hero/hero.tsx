import type { CSSProperties } from "react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { fill, pick, type Locale } from "@/lib/i18n/config";
import { getCountries, getCountryFlags } from "@/lib/cms/read";
import { countdownTarget, gamesDays, gamesEnd } from "@/data/event";
import { getLiveBaseline } from "@/lib/live/provider";
import { cn } from "@/lib/cn";
import type { Phase } from "@/lib/phase";
import { Icon } from "@/components/ui/icon";
import { heroMedia } from "@/data/hero";
import { DemoBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContentFlag, RichContent } from "@/components/ui/content-flag";
import { Flag } from "@/components/ui/flag";
import { Countdown } from "./countdown";
import { HeroParallax } from "./hero-parallax";
import { HeroPicture } from "./hero-picture";
import { HeroMascotInline, HeroMascots, HeroSwooshes } from "./hero-stage";
import { HeroVideo } from "./hero-video";

const i = (name: string, n: number) => ({ [name]: n }) as CSSProperties;

/**
 * Homepage hero, mascot-led: navy stage with the emblem's swooshes, left-aligned
 * overline + two-tone display title, the official tagline, yellow primary
 * action, the nine member flags, and the mascot trio running in on the right.
 * The entrance is pure CSS (no JS on the LCP path).
 */
export async function Hero({ dict, locale, phase = "pre", day = 1 }: { dict: Dictionary; locale: Locale; phase?: Phase; day?: number }) {
  const h = dict.hero;
  const [live, countries, flags] = await Promise.all([getLiveBaseline(), getCountries(), getCountryFlags()]);
  const liveCount = live.matches.filter((m) => m.status === "live").length;
  const cta =
    phase === "live"
      ? [
          { href: "#live", label: h.ctaLive },
          { href: "#results", label: h.ctaResults },
        ]
      : phase === "post"
        ? [
            { href: "#results", label: h.ctaResults },
            { href: "#media", label: h.ctaGallery },
          ]
        : [
            { href: `/${locale}#sports`, label: h.ctaPrimary },
            { href: `/${locale}#guide`, label: h.ctaSecondary },
          ];
  return (
    <div
      data-theme="dark"
      data-surface="black"
      className={cn(
        "relative isolate flex flex-col overflow-hidden bg-surface text-fg",
        // Phones before the Games: hero + countdown fill exactly the space above the quick bar.
        phase === "pre" ? "min-h-[calc(100svh-var(--quickbar-h))] tablet:min-h-svh" : "min-h-[82svh] tablet:min-h-svh",
      )}
    >
      {/* Art layer: brand swooshes and the mascot trio (optional photo or video underneath) */}
      <HeroParallax className="absolute inset-0 -z-10">
        <div className="hero-media absolute inset-0">
          {heroMedia.poster && <HeroPicture desktop={heroMedia.poster} mobile={heroMedia.posterMobile} />}
          {heroMedia.video && (
            <HeroVideo src={heroMedia.video} poster={heroMedia.poster?.src} labels={{ pause: dict.a11y.pause, play: dict.a11y.play }} />
          )}
          <HeroSwooshes className="absolute inset-0 size-full" />
        </div>
      </HeroParallax>
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10">
        <div className="absolute inset-0 scrim-side opacity-70" />
      </div>
      <span aria-hidden="true" className="absolute inset-y-0 left-0 -z-10 w-px bg-line-accent/40" />
      <HeroMascots />

      {/* Content */}
      <section
        id="top"
        aria-labelledby="hero-title"
        className={cn(
          "container-wide flex flex-1 flex-col justify-center desktop:pb-8",
          phase === "pre"
            ? "pt-[calc(var(--header-h)+var(--tk-space-4))] pb-5 short:pt-[calc(var(--header-h)+var(--tk-space-2))] short:pb-4 tablet:pt-[calc(var(--header-h)+var(--tk-space-8))] tablet:pb-7 squat:pt-[calc(var(--header-h)+var(--tk-space-3))] squat:pb-5"
            : "pt-[calc(var(--header-h)+var(--tk-space-6))] pb-7 tablet:pt-[calc(var(--header-h)+var(--tk-space-8))]",
        )}
      >
        <div className="max-w-content">
          <p className="hero-rise m-0 mb-4 type-overline short:mb-2 tablet:mb-6 squat:mb-3" style={i("--rise-i", -5)}>
            {phase === "post" ? h.postOverline : h.overline}
          </p>
          <h1 id="hero-title" className="relative isolate m-0">
            <HeroMascotInline />
            <span className="hero-rise mb-3 block type-heading-m short:mb-1 font-medium text-fg-2 tablet:type-heading-l" style={i("--rise-i", -4)}>
              {h.leadLine}
            </span>
            <span className="hero-line block type-display-xl squat:mr-[0.25em] squat:inline-block squat:text-[min(var(--tk-type-display-xl-size),17svh)]" style={i("--line-i", 0)}>
              {h.titleLine1}
            </span>{" "}
            <span className="hero-line hero-title-2026 block type-display-xl squat:inline-block squat:text-[min(var(--tk-type-display-xl-size),17svh)]" style={i("--line-i", 1)}>
              {h.titleLine2}
            </span>
          </h1>
          <p className="hero-rise m-0 mt-4 flex max-w-prose flex-wrap items-center gap-3 type-body-xl font-light text-fg-2 short:mt-2 tablet:mt-6 squat:mt-4" style={i("--rise-i", 0)}>
            <span>{phase === "post" ? h.postLine : h.tagline}</span>
          </p>
          {phase !== "post" && (
            <p className="hero-rise m-0 mt-3 flex flex-wrap items-center gap-3 type-heading-m font-extrabold uppercase" style={i("--rise-i", 1)}>
              <time dateTime="2027-03">{h.dates}</time>
              <ContentFlag>{h.datesFlag}</ContentFlag>
            </p>
          )}
          <div className="hero-cta mt-5 grid grid-cols-2 gap-3 short:mt-3 tablet:mt-7 tablet:flex squat:mt-5">
            <Button href={cta[0].href} variant="secondary" icon="arrow-right">
              {cta[0].label}
            </Button>
            <Button href={cta[1].href} variant="ghost">
              {cta[1].label}
            </Button>
          </div>

          {/* Phones and short screens: the nations row moves to the Countries section so the countdown stays in view. */}
          <div className="hero-cta mt-8 hidden tablet:flex tablet:items-center tablet:gap-5 squat:hidden">
            <p id="hero-nations" className="m-0 shrink-0 type-label text-fg-muted">
              {h.nations}
            </p>
            <ul aria-labelledby="hero-nations" className="m-0 flex list-none flex-wrap gap-2 p-0">
              {countries.map((c) => (
                <li key={c.code}>
                  <Flag code={c.code} name={pick(c.name, locale)} flag={c.flag} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Countdown band - inside the first viewport on every screen size */}
      <section
        id="countdown"
        aria-labelledby="countdown-title"
        className="hero-rise border-t border-line-accent/40 bg-surface/85"
        style={i("--rise-i", 2)}
      >
        {phase === "pre" && (
          <div className="container-wide flex flex-col gap-3 py-4 short:gap-2 short:py-3 tablet:gap-4 tablet:py-5 desktop:flex-row desktop:items-end desktop:justify-end desktop:gap-9 desktop:py-6 squat:py-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 tablet:flex-col tablet:items-start tablet:gap-2 desktop:items-end desktop:pb-5 desktop:text-right">
              <h2 id="countdown-title" className="m-0 type-overline">
                {dict.countdown.title}
              </h2>
              <p className="m-0 type-body-s text-fg-muted">
                <RichContent text={dict.countdown.timeNote} />
              </p>
            </div>
            <Countdown target={countdownTarget} end={gamesEnd} labels={dict.countdown} />
          </div>
        )}
        {phase === "live" && (
          <div className="container-wide flex flex-col gap-4 py-5 tablet:flex-row tablet:items-center tablet:justify-between desktop:py-6">
            <div className="flex max-w-md flex-1 flex-col gap-3">
              <h2 id="countdown-title" className="m-0 type-overline">
                {fill(h.liveDay, { day, total: gamesDays })}
              </h2>
              <div
                role="progressbar"
                aria-label={h.progress}
                aria-valuemin={1}
                aria-valuemax={gamesDays}
                aria-valuenow={day}
                className="relative h-1 overflow-hidden bg-line"
              >
                <span className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${(day / gamesDays) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-3 self-start tablet:self-auto">
              {live.isDemo && <DemoBadge label={dict.live.demoBadge} title={dict.live.demoNote} />}
              <a
                href="#live"
                className="press inline-flex min-h-touch-lg items-center gap-3 rounded-pill bg-live px-5 type-label text-on-live"
              >
                <span aria-hidden="true" className="live-dot size-2 rounded-pill bg-current" />
                {fill(h.liveNow, { n: liveCount })}
                <Icon name="arrow-right" className="nudge" />
              </a>
            </div>
          </div>
        )}
        {phase === "post" && (
          <div className="container-wide flex flex-col gap-4 py-5 desktop:flex-row desktop:items-center desktop:justify-between desktop:py-6">
            <h2 id="countdown-title" className="m-0 flex items-center gap-3 type-overline">
              {dict.hub.postTitle}
              {live.isDemo && <DemoBadge label={dict.live.demoBadge} title={dict.live.demoNote} />}
            </h2>
            <ol className="m-0 grid list-none grid-cols-3 gap-3 p-0 desktop:flex desktop:gap-6">
              {live.medals.slice(0, 3).map((r) => {
                const c = flags.find((x) => x.code === r.countryCode);
                return (
                  <li key={r.countryCode} className="flex items-center gap-3">
                    <span className="type-data-m text-accent tabular">{r.rank}</span>
                    <Flag code={r.countryCode} name={pick(r.name, locale)} flag={c?.flag} />
                    <span className="type-label max-tablet:sr-only">{pick(r.name, locale)}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </section>

      <a
        href={`/${locale}#games`}
        className="scroll-cue absolute bottom-0 left-1/2 hidden h-8 w-px -translate-x-1/2 overflow-hidden bg-line desktop:block"
        aria-label={h.scroll}
      />
    </div>
  );
}
