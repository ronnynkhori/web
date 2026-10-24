import Link from "next/link";
import { getSport } from "@/data/sports";
import { AddToCalendar } from "@/components/ui/add-to-calendar";
import { Icon } from "@/components/ui/icon";
import type { ScheduleDoc } from "@/lib/cms/types";
import { fill, pick, type Locale } from "@/lib/i18n/config";

/** Competition sessions grouped by day; sport names link to their pages. */
export function ScheduleDays({
  schedule,
  locale,
  addDayLabel,
  addLabel,
}: {
  schedule: ScheduleDoc[];
  locale: Locale;
  /** "Add {day} to your calendar"; omit to hide the per-day calendar button. */
  addDayLabel?: string;
  addLabel?: string;
}) {
  const days = [...new Set(schedule.map((s) => s.date))];
  const dayLabel = new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
  return (
    <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
      {days.map((date) => {
        const sessions = schedule.filter((s) => s.date === date);
        const day = dayLabel.format(new Date(date));
        return (
          <div key={date} className="flex flex-col rounded-sm border border-line bg-surface p-4">
            <h3 className="m-0 mb-3 type-label text-accent">
              <time dateTime={date}>{day}</time>
            </h3>
            <ul className="m-0 flex list-none flex-col divide-y divide-line p-0">
              {sessions.map((s) => {
                const sport = getSport(s.sportId);
                return (
                  <li key={s.id} className="grid grid-cols-[3.5rem_1fr] gap-3 py-2">
                    <time dateTime={`${s.date}T${s.time}`} className="type-data-m tabular">
                      {s.time}
                    </time>
                    <span className="flex flex-col">
                      <span className="type-label">
                        {sport && (
                          <>
                            <Link href={`/${locale}/sports/${sport.id}`} className="text-link underline-offset-4 hover:underline">
                              {pick(sport.name, locale)}
                            </Link>
                            {" · "}
                          </>
                        )}
                        {pick(s.event, locale)}
                      </span>
                      <span className="flex items-center gap-1 type-caption text-fg-muted">
                        <Icon name="pin" size={16} />
                        {pick(s.venue, locale)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            {addDayLabel && addLabel && (
              <AddToCalendar
                className="mt-auto pt-2"
                fileName={`cplp2027-${date}`}
                label={addLabel}
                srLabel={fill(addDayLabel, { day })}
                events={sessions.map((s) => {
                  const sport = getSport(s.sportId);
                  return {
                    uid: `schedule-${s.id}`,
                    title: `${sport ? `${pick(sport.name, locale)}: ` : ""}${pick(s.event, locale)}`,
                    start: `${s.date}T${s.time}:00+01:00`,
                    location: pick(s.venue, locale) || undefined,
                  };
                })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
