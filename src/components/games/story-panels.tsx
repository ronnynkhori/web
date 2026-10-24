import type { HTMLAttributes } from "react";
import type { ImageAsset, Tone } from "@/data/types";
import { Icon } from "@/components/ui/icon";
import { MediaFrame } from "@/components/ui/media-frame";
import { RichContent } from "@/components/ui/content-flag";
import { TorchStripe } from "@/components/ui/torch-stripe";
import { reveal } from "@/lib/animation/reveal";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/format";

export interface StoryBeatView {
  id: string;
  kicker: string;
  headline: string;
  body: string;
  tone: Tone;
  image?: ImageAsset;
  imageAlt?: string;
  place?: string;
  facts?: Array<{ value: string; label: string }>;
}

/**
 * The Games story below desktop, on a full-bleed dark stage: each beat is a
 * full-frame photo under the region scrim with the headline over deep green.
 * Compact (Games time): the beats become a swipe row of shorter cards.
 * Desktop uses <StoryMosaic/> instead.
 */
export function StoryPanels({
  beats,
  labels,
  compact,
  className,
}: {
  beats: StoryBeatView[];
  labels: { list: string; photo: string };
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      data-theme="dark"
      data-surface="black"
      data-compact={compact ? "" : undefined}
      className={cn("story relative overflow-hidden bg-surface text-fg", className)}
    >
      <div aria-hidden="true" className="story-glow" />
      <TorchStripe className="absolute inset-x-0 top-0 z-raised" />

      <ol className="story-list m-0 list-none p-0" aria-label={labels.list}>
        {beats.map((beat, i) => (
          <li key={beat.id} className="story-beat">
            <article className="story-stage">
              <div className="story-media-slot" aria-hidden={beat.image ? undefined : true}>
                <div className="absolute inset-0 overflow-hidden" {...reveal("image", 0)}>
                  {/* 100vw: landscape photos covering a tall slot render wider than the slot itself. */}
                  <MediaFrame
                    ratio="fill"
                    image={beat.image}
                    alt={beat.imageAlt}
                    tone={beat.tone}
                    placeholderLabel={labels.photo}
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 scrim-hero" />
                  {beat.place && (
                    <p className="story-place m-0 inline-flex items-center gap-2 rounded-pill bg-surface/70 px-3 py-1 type-caption font-semibold text-fg backdrop-blur-sm">
                      <Icon name="pin" size={16} className="text-accent" />
                      {beat.place}
                    </p>
                  )}
                </div>
              </div>

              <span aria-hidden="true" className="story-ghost tabular">
                {pad2(i + 1)}
              </span>

              <div className="story-copy container-wide">
                <div className="flex max-w-xl flex-col gap-4">
                  <p className="m-0 flex items-center gap-3" {...reveal("fade-up", 0)}>
                    <span className="type-data-m text-accent tabular">{pad2(i + 1)}</span>
                    <span aria-hidden="true" className="h-px w-7 bg-line-accent" />
                    <span className="type-overline text-fg-2">{beat.kicker}</span>
                  </p>
                  <h3 className="m-0 type-display-l text-balance" {...reveal("mask", 1, "text-line")}>
                    {beat.headline}
                  </h3>
                  <p className="m-0 max-w-prose type-body-l text-fg-2" {...reveal("fade-up", 2, "text-line")}>
                    <RichContent text={beat.body} />
                  </p>
                  {beat.facts && <StoryFacts facts={beat.facts} {...reveal("fade-up", 3, "text-line")} />}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function StoryFacts({
  facts,
  className,
  ...rest
}: {
  facts: NonNullable<StoryBeatView["facts"]>;
  className?: string;
} & HTMLAttributes<HTMLDListElement>) {
  return (
    <dl className={cn("story-facts m-0 mt-2 flex border-t border-line pt-5", className)} {...rest}>
      {facts.map((f) => (
        <div key={f.label} className="flex min-w-0 flex-1 flex-col gap-1 border-r border-line pr-4 not-first:pl-4 last:border-r-0">
          <dt className="order-2 type-caption text-fg-muted">{f.label}</dt>
          <dd className="order-1 m-0 type-heading-l text-accent tabular">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}
