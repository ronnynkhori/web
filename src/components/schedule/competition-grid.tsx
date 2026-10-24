import Link from "next/link";
import { competitionDays, sports } from "@/data/sports";
import { activities, keyDates } from "@/data/event";
import { Icon } from "@/components/ui/icon";
import type { CalendarEvent } from "@/lib/calendar";
import { cn } from "@/lib/cn";
import { pick, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const OPENING = "2026-12-04";
const CLOSING = "2026-12-13";

/** Sport x day grid from the CDM competition schedule (Table 12). Scrolls sideways on small screens. */
export function CompetitionGrid({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const p = dict.pages;
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const rows = sports.filter((s) => s.programme);
  const cell = "h-touch min-w-touch border-b border-line p-1 text-center";
  return (
    <div className="flex flex-col gap-3">
      <p className="m-0 type-caption text-fg-muted desktop:hidden">{p.glanceScroll}</p>
      <div
        className="overflow-x-auto rounded-sm border border-line focus-visible:outline-2 focus-visible:outline-focus"
        tabIndex={0}
        role="region"
        aria-labelledby="glance-caption"
      >
        <table className="w-full border-collapse type-body-s">
          <caption id="glance-caption" className="sr-only">
            {p.glanceCaption}
          </caption>
          <thead>
            <tr className="bg-surface-2">
              <th scope="col" className="sticky left-0 z-1 border-b border-line bg-surface-2 px-3 py-2 text-left type-label">
                {p.glanceSport}
              </th>
              {competitionDays.map((iso) => (
                <th key={iso} scope="col" className="border-b border-line px-1 py-2 text-center font-normal">
                  <span className="block type-caption uppercase text-fg-muted">{weekday.format(new Date(iso))}</span>
                  <time dateTime={iso} className="type-label tabular">
                    {Number(iso.slice(8))}
                  </time>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <CeremonyRow label={p.ceremonies} cellClass={cell} ceremony={p.glanceCeremony} />
            {rows.map((sport) => {
              const days = new Set(sport.programme!.days);
              const rest = new Set(sport.programme!.rest ?? []);
              return (
                <tr key={sport.id}>
                  <th scope="row" className="sticky left-0 z-1 border-b border-line bg-surface px-3 py-2 text-left font-normal whitespace-nowrap">
                    <Link href={`/${locale}/sports/${sport.id}`} className="type-label text-link underline-offset-4 hover:underline">
                      {pick(sport.name, locale)}
                    </Link>
                  </th>
                  {competitionDays.map((iso) => (
                    <td key={iso} className={cell}>
                      {days.has(iso) ? (
                        <span className="mx-auto block size-5 rounded-xs bg-accent" title={p.glanceCompeting}>
                          <span className="sr-only">{p.glanceCompeting}</span>
                        </span>
                      ) : rest.has(iso) ? (
                        <span className="mx-auto block size-5 rounded-xs border border-dashed border-line-strong" title={p.glanceRest}>
                          <span className="sr-only">{p.glanceRest}</span>
                        </span>
                      ) : null}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 type-caption text-fg-2" aria-hidden="true">
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-xs bg-accent" /> {p.glanceCompeting}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-xs border border-dashed border-line-strong" /> {p.glanceRest}
        </li>
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-xs bg-band-highlight" /> {p.glanceCeremony}
        </li>
      </ul>
    </div>
  );
}

function CeremonyRow({ label, cellClass, ceremony }: { label: string; cellClass: string; ceremony: string }) {
  return (
    <tr>
      <th scope="row" className="sticky left-0 z-1 border-b border-line bg-surface px-3 py-2 text-left type-label whitespace-nowrap">
        {label}
      </th>
      {competitionDays.map((iso) => (
        <td key={iso} className={cellClass}>
          {(iso === OPENING || iso === CLOSING) && (
            <span className="mx-auto block size-5 rounded-xs bg-band-highlight" title={ceremony}>
              <span className="sr-only">{ceremony}</span>
            </span>
          )}
        </td>
      ))}
    </tr>
  );
}

type ActivityLabels = Dictionary["guide"]["activities"];

export function activityEvents(labels: ActivityLabels): CalendarEvent[] {
  return activities.map((a) => {
    const key = keyDates.find((k) => k.key === a.key);
    const start = key?.time ? `${a.iso}T${key.time}:00+01:00` : a.iso;
    return { uid: `activity-${a.key}`, title: `CPLP 2027: ${labels[a.key]}`, start, location: key?.location };
  });
}

/** The CDM calendar of activities, grouped by day. */
export function ActivityCalendar({ labels, locale, className }: { labels: ActivityLabels; locale: Locale; className?: string }) {
  const day = new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  const byDay = new Map<string, (typeof activities)[number][]>();
  for (const a of activities) byDay.set(a.iso, [...(byDay.get(a.iso) ?? []), a]);
  return (
    <ol className={cn("m-0 grid list-none gap-3 p-0 tablet:grid-cols-2 desktop:grid-cols-3", className)}>
      {[...byDay].map(([iso, items]) => (
        <li key={iso} className="flex flex-col gap-2 rounded-sm border border-line bg-surface p-4">
          <time dateTime={iso} className="type-overline text-accent">
            {day.format(new Date(iso))}
          </time>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {items.map((a) => {
              const key = keyDates.find((k) => k.key === a.key);
              return (
                <li key={a.key} className="flex flex-col">
                  <span className="type-label">{labels[a.key]}</span>
                  {key?.place && (
                    <span className="flex items-center gap-1 type-caption text-fg-muted">
                      <Icon name="pin" size={16} />
                      {key.place}
                      {key.time && ` · ${key.time}`}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ol>
  );
}

