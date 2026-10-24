import { Icon } from "@/components/ui/icon";
import { MediaFrame } from "@/components/ui/media-frame";
import { RichContent } from "@/components/ui/content-flag";
import { TorchStripe } from "@/components/ui/torch-stripe";
import { reveal } from "@/lib/animation/reveal";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/format";
import { StoryFacts, type StoryBeatView } from "./story-panels";

/**
 * Photos cover their tile, so a landscape photo in a tall tile renders wider
 * than the tile. Widths here are what each slot needs at 64rem and up.
 */
const slotSizes = ["75vw", "50vw", "60vw", "35vw", "35vw"];

/**
 * The Games story on desktop: every beat visible at once as an editorial
 * mosaic on the dark stage. The first beat is the always-open hero tile; the
 * others reveal body and facts on hover or keyboard focus (always shown on
 * touch screens). CSS only - the page scrolls normally.
 */
export function StoryMosaic({
  beats,
  labels,
  className,
}: {
  beats: StoryBeatView[];
  labels: { list: string; photo: string };
  className?: string;
}) {
  return (
    <div data-theme="dark" data-surface="black" className={cn("relative overflow-hidden bg-surface py-8 text-fg", className)}>
      <div aria-hidden="true" className="story-glow" />
      <TorchStripe className="absolute inset-x-0 top-0 z-raised" />

      <ol className="mosaic container-wide relative m-0 list-none" aria-label={labels.list}>
        {beats.map((beat, i) => {
          const featured = i === 0;
          const headingId = `mosaic-${beat.id}`;
          return (
            <li key={beat.id} className="mosaic-slot" {...reveal("image", i)}>
              <article
                tabIndex={0}
                aria-labelledby={headingId}
                data-featured={featured ? "" : undefined}
                className="mosaic-tile group relative size-full overflow-hidden rounded-sm bg-surface-raised outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                <MediaFrame
                  ratio="fill"
                  image={beat.image}
                  alt={beat.imageAlt}
                  tone={beat.tone}
                  placeholderLabel={labels.photo}
                  sizes={`(min-width: 64rem) ${slotSizes[i] ?? "35vw"}, 100vw`}
                  mediaClassName="media-zoom"
                />
                <div aria-hidden="true" className="mosaic-scrim absolute inset-0" />
                <span aria-hidden="true" className="rule-wipe absolute inset-x-0 top-0 z-raised h-0.5 bg-accent" />

                {beat.place && (
                  <p className="mosaic-place absolute top-4 right-4 z-raised m-0 inline-flex items-center gap-2 rounded-pill bg-surface/70 px-3 py-1 type-caption font-semibold text-fg backdrop-blur-sm">
                    <Icon name="pin" size={16} className="text-accent" />
                    {beat.place}
                  </p>
                )}

                <div className={cn("absolute inset-x-0 bottom-0 z-raised flex flex-col gap-3", featured ? "p-8" : "p-5")}>
                  <p className="m-0 flex items-center gap-3">
                    <span className="type-data-m text-accent tabular">{pad2(i + 1)}</span>
                    {featured && <span aria-hidden="true" className="h-px w-7 bg-line-accent" />}
                    <span className="type-overline text-fg-2">{beat.kicker}</span>
                  </p>
                  <h3 id={headingId} className={cn("m-0 text-balance", featured ? "type-display-l" : "type-display-m")}>
                    {beat.headline}
                  </h3>
                  <div className="mosaic-details">
                    <div className="flex min-h-0 flex-col gap-3">
                      <p className={cn("m-0 max-w-prose text-fg-2", featured ? "type-body-l" : "type-body-s")}>
                        <RichContent text={beat.body} />
                      </p>
                      {beat.facts && <StoryFacts facts={beat.facts} className={featured ? undefined : "mt-0 pt-3"} />}
                    </div>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
