import type { CSSProperties } from "react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { fill, pick, type Locale } from "@/lib/i18n/config";
import { getCountryFlags } from "@/lib/cms/read";
import { countdownTarget, gamesDays, gamesEnd } from "@/data/event";
import { mascotPoses } from "@/data/mascot";
import { getLiveBaseline } from "@/lib/live/provider";
import { cn } from "@/lib/cn";
import type { Phase } from "@/lib/phase";
import { Icon } from "@/components/ui/icon";
import { DemoBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichContent } from "@/components/ui/content-flag";
import { Flag } from "@/components/ui/flag";
import { MascotActor } from "@/components/mascot/mascot-actor";
import { Countdown } from "./countdown";
import { HeroPhotoBackdrop } from "./hero-stage";
import { demoImages } from "@/data/demo/images";

const i = (name: string, n: number) => ({ [name]: n }) as CSSProperties;

/**
 * Homepage hero, in the same quiet shape as a games opener: one photograph
 * on the right, the title on the left, and a single mascot standing in the
 * countdown band. The entrance is pure CSS (no JS on the LCP path).
 */
export async function Hero({ dict, locale, phase = "pre", day = 1 }: { dict: Dictionary; locale: Locale; phase?: Phase; day?: number }) {
  const h = dict.hero;
  const [live, flags] = await Promise.all([getLiveBaseline(), getCountryFlags()]);
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
      data-hero=""
      data-theme="dark"
      data-surface="black"
      className={cn(
        "relative isolate flex flex-col overflow-hidden bg-surface text-fg",
        // Phones before the Games: hero + countdown fill exactly the space above the quick bar.
        phase === "pre" ? "min-h-[calc(100svh-var(--quickbar-h))] tablet:min-h-svh" : "min-h-[82svh] tablet:min-h-svh",
      )}
    >
      {/* Photograph only in the space above the countdown, so she stands on the gold line. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
      <HeroPhotoBackdrop image={demoImages.karate} />

      <section
        id="top"
        aria-labelledby="hero-title"
        className={cn(
          "container-wide relative z-10 flex flex-1 flex-col justify-center",
          phase === "pre"
            ? "pt-[calc(var(--header-h)+var(--tk-space-2))] pb-5 lowphone:pb-3 short:pb-2 tablet:pt-[calc(var(--header-h)+var(--tk-space-6))] tablet:pb-8 squat:pt-[calc(var(--header-h)+var(--tk-space-3))] squat:pb-5"
            : "pt-[calc(var(--header-h)+var(--tk-space-4))] pb-7 tablet:pt-[calc(var(--header-h)+var(--tk-space-8))]",
        )}
      >
        <div className="max-w-[38rem]">
          <p className="hero-rise m-0 mb-3 type-overline max-tablet:text-[min(0.75rem,2.6vw)] max-tablet:tracking-[0.03em] tablet:mb-5 squat:mb-3" style={i("--rise-i", -5)}>
            {phase === "post" ? h.postOverline : h.overline}
          </p>
          <h1 id="hero-title" className="m-0">
            <span className="hero-rise mb-2 block type-heading-m font-medium text-fg-2 max-tablet:text-[min(1.25rem,5.2vw)] tablet:mb-3 desktop:type-heading-l" style={i("--rise-i", -4)}>
              {h.leadLine}
            </span>
            <span className="hero-line mr-[0.25em] inline-block type-display-xl tall:block tablet:text-[min(var(--tk-type-display-xl-size),12.5svh)] squat:text-[min(var(--tk-type-display-xl-size),9.5svh)]" style={i("--line-i", 0)}>
              {h.titleLine1}
            </span>
            <span className="hero-line hero-title-2026 inline-block type-display-xl tall:block tablet:text-[min(var(--tk-type-display-xl-size),12.5svh)] squat:text-[min(var(--tk-type-display-xl-size),9.5svh)]" style={i("--line-i", 1)}>
              {h.titleLine2}
            </span>
          </h1>
          <p className="hero-rise m-0 mt-4 flex max-w-prose flex-wrap items-center gap-3 type-body-xl font-light text-fg-2 short:hidden tablet:mt-6 squat:mt-4" style={i("--rise-i", 0)}>
            <span>{phase === "post" ? h.postLine : h.tagline}</span>
          </p>
          {phase !== "post" && (
            <p className="hero-rise m-0 mt-4 flex flex-wrap items-center gap-3 type-heading-m short:mt-3 font-extrabold uppercase" style={i("--rise-i", 1)}>
              <time dateTime="2027-03-25">{h.dates}</time>
            </p>
          )}
          <div className="hero-cta mt-6 flex flex-wrap gap-3 short:mt-3 tablet:mt-7 squat:mt-5 *:whitespace-nowrap">
            <Button href={cta[0].href} variant="secondary" icon="arrow-right">
              {cta[0].label}
            </Button>
            <Button href={cta[1].href} variant="ghost">
              {cta[1].label}
            </Button>
          </div>
        </div>
      </section>
      </div>

      {/* Countdown band - inside the first viewport on every screen size */}
      <section
        id="countdown"
        aria-labelledby="countdown-title"
        className="hero-rise relative z-10 border-t border-line-accent"
        style={i("--rise-i", 2)}
      >
        {phase === "pre" && (
          <div className="container-wide flex flex-col items-center gap-3 py-4 short:gap-2 short:py-3 tablet:flex-row tablet:items-end tablet:justify-center tablet:gap-10 tablet:py-4 squat:gap-6 squat:py-3">
            <div className="flex flex-col items-center gap-1 text-center">
              <h2 id="countdown-title" className="m-0 type-overline">
                {dict.countdown.title}
              </h2>
              <p className="m-0 type-body-s text-fg-muted max-tablet:hidden">
                <RichContent text={dict.countdown.timeNote} />
              </p>
              <MascotActor
                {...mascotPoses.thumbsUp}
                alt=""
                sizes="96px"
                enter={false}
                className="mt-1 h-16 w-auto squat:h-14"
                imgClassName="h-full w-auto"
              />
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
    </div>
  );
}
