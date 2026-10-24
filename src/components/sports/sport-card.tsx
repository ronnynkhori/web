import Link from "next/link";
import { MascotActor } from "@/components/mascot/mascot-actor";
import type { ImageAsset, Tone } from "@/data/types";
import { MediaFrame } from "@/components/ui/media-frame";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/format";

export interface SportView {
  id: string;
  name: string;
  category: string;
  tone: Tone;
  image?: ImageAsset;
  imageAlt?: string;
  /** Official mascot pose for the sport; stands on the colour panel. */
  mascot?: { src: string; width: number; height: number };
  /** The sport's page; the whole card links there. */
  href?: string;
}

const panelClass: Record<Tone, string> = {
  energy: "bg-band-energy text-on-band-energy",
  region: "bg-band-region text-on-band-region",
  highlight: "bg-band-highlight text-on-band-highlight",
  premium: "bg-band-premium text-on-band-premium",
  neutral: "bg-surface-raised text-fg",
};

/**
 * Sport card: photo on top, a brand-colour panel below with the category and
 * name, and the sport's mascot standing on the panel, breaking up into the photo.
 */
export function SportCard({
  sport,
  index,
  labels,
  headingLevel = "h3",
}: {
  sport: SportView;
  index: number;
  labels: { photo: string };
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const card = (
    <article className="group lift @container relative isolate flex h-full flex-col overflow-hidden rounded-sm bg-surface-raised shadow-sm">
      <MediaFrame
        ratio="1/1"
        image={sport.image}
        alt={sport.imageAlt}
        tone={sport.tone}
        placeholderLabel={labels.photo}
        sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 40vw, 72vw"
        mediaClassName="sport-media"
      >
        <span
          aria-hidden="true"
          data-theme="dark"
          className="absolute top-3 left-3 z-raised rounded-pill bg-surface/70 px-3 py-1 type-label font-extrabold text-fg tabular backdrop-blur-sm"
        >
          {pad2(index + 1)}
        </span>
      </MediaFrame>

      <div className={cn("sport-panel relative z-raised mt-auto flex min-h-30 flex-col justify-end gap-1 p-4 pr-[49%] tablet:p-5 tablet:pr-[49%]", panelClass[sport.tone])}>
        <svg aria-hidden="true" viewBox="0 0 200 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 -z-[1] size-full opacity-15">
          <path d="M0 78 C 60 60 130 40 200 6 L 200 26 C 130 62 60 82 0 96 Z" fill="currentColor" />
        </svg>
        <p className="m-0 type-label tracking-[0.14em] uppercase opacity-85">{sport.category}</p>
        <Heading id={`sport-card-${sport.id}`} className="m-0 font-display text-[clamp(1rem,6.6cqw,1.6rem)] leading-[0.95] font-extrabold text-balance uppercase">
          {sport.name}
        </Heading>
        {sport.mascot && (
          <MascotActor
            {...sport.mascot}
            sizes="(min-width: 64rem) 12rem, 40vw"
            tap={false}
            delay={(index % 4) * 90}
            depth={0}
            className="pointer-events-none absolute right-1 bottom-2 h-[165%] max-w-[48%]"
            imgClassName="h-full w-auto object-contain object-bottom drop-shadow-[0_10px_14px_rgb(0_0_0/0.35)]"
          />
        )}
      </div>
    </article>
  );
  if (!sport.href) return card;
  return (
    <Link href={sport.href} aria-labelledby={`sport-card-${sport.id}`} className="block h-full rounded-sm">
      {card}
    </Link>
  );
}
