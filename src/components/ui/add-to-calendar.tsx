"use client";

import { buildIcs, type CalendarEvent } from "@/lib/calendar";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

/** Downloads an .ics file that every calendar app can import. */
export function AddToCalendar({
  events,
  fileName,
  label,
  srLabel,
  className,
}: {
  events: CalendarEvent[];
  fileName: string;
  label: string;
  /** Fuller accessible name when the visible label is short. */
  srLabel?: string;
  className?: string;
}) {
  const download = () => {
    const url = URL.createObjectURL(new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <button
      type="button"
      onClick={download}
      aria-label={srLabel}
      className={cn("inline-flex min-h-touch items-center gap-2 type-label text-link underline-offset-4 hover:underline", className)}
    >
      <Icon name="calendar" size={16} />
      {label}
    </button>
  );
}
