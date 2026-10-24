import type { Venue } from "@/data/types";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { isPending } from "@/lib/content";
import { fill, pick, type Locale } from "@/lib/i18n/config";
import { getVenues } from "@/lib/cms/read";
import { reveal } from "@/lib/animation/reveal";
import { pad2 } from "@/lib/format";
import { Icon } from "@/components/ui/icon";
import { MediaFrame } from "@/components/ui/media-frame";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { VenuesTable } from "./venues-table";

function accessible(venue: Venue, locale: Locale): string {
  return venue.accessibility ? pick(venue.accessibility, locale).trim() : "";
}

/** The LOC's link if given; otherwise an OpenStreetMap search, only for venues whose location is known. */
function mapLink(venue: Venue): string | null {
  if (venue.mapUrl) return venue.mapUrl;
  const area = venue.area.en;
  if (venue.status === "required" || isPending(area)) return null;
  const query = [venue.address ?? venue.name.pt, area].join(", ");
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}

/**
 * Venues (#venues). Names follow the CDM venue table. Phones: swipe row;
 * desktop: four photo cards. [DECISION REQUIRED] map provider before a map is added.
 */
export async function VenuesSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const v = dict.venues;
  const all = await getVenues();
  const venues = all.filter((venue) => venue.image?.src);
  const competition = all.filter((venue) => !venue.image?.src);
  return (
    <Section id="venues" labelledBy="venues-title">
      <SectionHeader id="venues-title" overline={v.overline} title={v.title} intro={v.intro} />
      <ol className="mx-[calc(-1*var(--page-margin))] m-0 flex list-none snap-x snap-mandatory scroll-px-(--page-margin) gap-4 overflow-x-auto px-(--page-margin) pb-2 [scrollbar-width:none] desktop:mx-0 desktop:grid desktop:grid-cols-4 desktop:overflow-visible desktop:px-0">
        {venues.map((venue, i) => (
          <li key={venue.id} className="w-[78vw] max-w-80 shrink-0 snap-start tablet:w-[44vw] desktop:w-auto desktop:max-w-none" {...reveal("fade-up", i)}>
            <article className="group flex h-full flex-col overflow-hidden rounded-sm border border-line bg-surface-2">
              <MediaFrame
                ratio="3/2"
                className="desktop:aspect-[4/5]"
                image={venue.image}
                alt={venue.image?.alt ? pick(venue.image.alt, locale) : ""}
                tone={venue.tone}
                sizes="(min-width: 64rem) 40vw, (min-width: 40rem) 50vw, 85vw"
                mediaClassName="media-zoom"
                scrim="card"
              >
                <span data-theme="dark" className="absolute top-4 left-4 type-data-m text-accent tabular" aria-hidden="true">
                  {pad2(i + 1)}
                </span>
                <h3 data-theme="dark" className="absolute inset-x-0 bottom-0 m-0 p-4 type-heading-m text-fg">
                  <span className="sr-only">{fill(v.numbered, { n: i + 1 })}: </span>
                  {pick(venue.name, locale)}
                </h3>
              </MediaFrame>
              <dl className="m-0 flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start gap-2 type-body-s text-fg-2">
                  <dt className="sr-only">{v.overline}</dt>
                  <Icon name="calendar" size={16} className="mt-1 shrink-0 text-accent" />
                  <dd className="m-0">{pick(venue.role, locale)}</dd>
                </div>
                {pick(venue.sports, locale) !== "—" && (
                  <div className="flex items-start gap-2 type-body-s text-fg-2">
                    <dt className="sr-only">{v.sportsHosted}</dt>
                    <Icon name="grid" size={16} className="mt-1 shrink-0 text-accent" />
                    <dd className="m-0">{pick(venue.sports, locale)}</dd>
                  </div>
                )}
                {(venue.address || !isPending(venue.area.en)) && (
                  <div className="flex items-start gap-2 type-body-s text-fg-2">
                    <dt className="sr-only">{v.area}</dt>
                    <Icon name="pin" size={16} className="mt-1 shrink-0 text-accent" />
                    <dd className="m-0">{[venue.address, isPending(venue.area.en) ? "" : pick(venue.area, locale)].filter(Boolean).join(", ")}</dd>
                  </div>
                )}
                {accessible(venue, locale) && (
                  <div className="flex items-start gap-2 type-body-s text-fg-2">
                    <dt className="sr-only">{v.accessibility}</dt>
                    <Icon name="access" size={16} className="mt-1 shrink-0 text-accent" />
                    <dd className="m-0">{accessible(venue, locale)}</dd>
                  </div>
                )}
              </dl>
              {mapLink(venue) && (
                <a
                  href={mapLink(venue)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-4 mb-4 inline-flex min-h-touch items-center gap-2 self-start type-label text-link underline-offset-4 hover:underline"
                >
                  <Icon name="external" size={16} />
                  {v.openMap}
                  <span className="sr-only">: {pick(venue.name, locale)}</span>
                </a>
              )}
            </article>
          </li>
        ))}
      </ol>
      {competition.length > 0 && (
        <VenuesTable
          rows={competition.map((venue) => ({
            id: venue.id,
            name: pick(venue.name, locale),
            sport: pick(venue.sports, locale),
            area: isPending(venue.area.en) ? undefined : pick(venue.area, locale),
            map: mapLink(venue) ?? undefined,
          }))}
          labels={{
            title: v.competitionVenues,
            caption: v.competitionCaption,
            venue: v.venue,
            sports: v.sportsHosted,
            openMap: v.openMap,
            pages: v.pages,
            showing: v.showing,
            prevPage: v.prevPage,
            nextPage: v.nextPage,
            pageN: v.pageN,
          }}
        />
      )}
    </Section>
  );
}
