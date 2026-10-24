import Image from "next/image";
import Link from "next/link";
import type { ImageAsset, Tone } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { MediaFrame } from "@/components/ui/media-frame";
import { pad2 } from "@/lib/format";

export interface SportView {
  id: string;
  name: string;
  category: string;
  tone: Tone;
  image?: ImageAsset;
  imageAlt?: string;
  /** Official mascot pose for the sport, shown over the photo. */
  mascot?: { src: string; width: number; height: number };
  /** The sport's page; the whole card links there. */
  href?: string;
}

/** Sport card: 4:5 media, scrim, category badge, display name and the mascot pose. */
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
    <article className="group lift relative h-full overflow-hidden rounded-xs border border-line bg-surface-raised">
      <span aria-hidden="true" className="rule-wipe absolute inset-x-0 top-0 z-raised h-1 bg-line-accent" />
      <MediaFrame
        ratio="4/5"
        image={sport.image}
        alt={sport.imageAlt}
        tone={sport.tone}
        scrim="card"
        placeholderLabel={labels.photo}
        sizes="(min-width: 64rem) 22rem, (min-width: 40rem) 40vw, 72vw"
        mediaClassName="sport-media"
      >
        {sport.mascot && (
          <Image
            src={sport.mascot.src}
            alt=""
            width={sport.mascot.width}
            height={sport.mascot.height}
            sizes="(min-width: 64rem) 14rem, 45vw"
            className="mascot-pop pointer-events-none absolute -right-3 bottom-[5.5rem] z-raised h-[58%] w-auto drop-shadow-[0_10px_18px_rgb(0_0_0/0.45)] transition-transform duration-ui ease-emphasized group-hover:-translate-y-2 group-hover:rotate-2"
          />
        )}
        <span
          aria-hidden="true"
          className="index-num absolute top-3 right-3 z-raised type-heading-m font-extrabold text-fg tabular [text-shadow:0_1px_10px_rgb(2_2_2/0.75)]"
          data-theme="dark"
        >
          {pad2(index + 1)}
        </span>
        <div data-theme="dark" className="absolute inset-x-0 bottom-0 z-raised flex flex-col gap-3 p-4 text-fg tablet:p-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="category">{sport.category}</Badge>
          </div>
          <Heading id={`sport-card-${sport.id}`} className="m-0 type-display-m">
            {sport.name}
          </Heading>
        </div>
      </MediaFrame>
    </article>
  );
  if (!sport.href) return card;
  return (
    <Link href={sport.href} aria-labelledby={`sport-card-${sport.id}`} className="block h-full rounded-xs">
      {card}
    </Link>
  );
}
