import { keyDates } from "@/data/event";
import { Icon } from "@/components/ui/icon";
import type { CalendarEvent } from "@/lib/calendar";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type Labels = Pick<Dictionary["guide"], "opening" | "cultural" | "closing" | "timeZone" | "timeZoneNote">;

export function keyDateEvents(labels: Labels): CalendarEvent[] {
  return keyDates.map((d) => ({
    uid: `key-${d.key}`,
    title: `CPLP 2027: ${labels[d.key]}`,
    start: d.time ? `${d.iso}T${d.time}:00+01:00` : d.iso,
    location: d.location,
  }));
}

/** Opening, Cultural Night and closing, plus the time zone every time on the site uses. */
export function KeyDates({ labels, locale, className }: { labels: Labels; locale: Locale; className?: string }) {
  const month = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" });
  return (
    <ul className={cn("m-0 grid list-none grid-cols-2 gap-3 p-0 desktop:grid-cols-4 desktop:gap-4", className)}>
      {keyDates.map((d, i) => (
        <li
          key={d.key}
          data-theme={i === 0 ? "dark" : undefined}
          className={cn(
            "relative flex flex-col gap-1 overflow-hidden rounded-sm border p-4 tablet:p-5",
            i === 0 ? "border-transparent bg-surface text-fg" : "border-line bg-surface",
          )}
        >
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-line-accent" />
          <span className="flex items-baseline gap-2">
            <time dateTime={d.iso} className="type-display-m tabular">
              {d.iso.slice(8)}
            </time>
            <span className="type-overline text-accent">{month.format(new Date(d.iso))}</span>
          </span>
          <span className="type-label">{labels[d.key]}</span>
          {d.place && (
            <span className="flex items-center gap-1 type-caption text-fg-muted">
              <Icon name="pin" size={16} />
              {d.place}
              {d.time && (
                <>
                  {" · "}
                  <time dateTime={`${d.iso}T${d.time}+01:00`}>{d.time}</time>
                </>
              )}
            </span>
          )}
        </li>
      ))}
      <li className="relative flex flex-col gap-1 overflow-hidden rounded-sm border border-line bg-surface p-4 tablet:p-5">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-line-accent" />
        <span className="flex items-baseline gap-2">
          <span className="type-display-m tabular">UTC+1</span>
        </span>
        <span className="type-label">{labels.timeZone}</span>
        <span className="flex items-center gap-1 type-caption text-fg-muted">
          <Icon name="clock" size={16} />
          {labels.timeZoneNote}
        </span>
      </li>
    </ul>
  );
}
