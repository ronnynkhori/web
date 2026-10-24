/** Minimal iCalendar (RFC 5545) export for "Add to calendar". */
export interface CalendarEvent {
  uid: string;
  title: string;
  /** ISO date-time (timed event) or YYYY-MM-DD (all-day event). */
  start: string;
  location?: string;
  description?: string;
}

const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");

const utc = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

/** Lines over 75 octets must be folded (approximated by characters). */
const fold = (line: string) => line.match(/.{1,74}/g)?.join("\r\n ") ?? line;

export function buildIcs(events: CalendarEvent[], now = new Date()): string {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CPLP 2027//Games website//EN", "CALSCALE:GREGORIAN"];
  for (const e of events) {
    const allDay = /^\d{4}-\d{2}-\d{2}$/.test(e.start);
    lines.push("BEGIN:VEVENT", `UID:${e.uid}@cplp2027`, `DTSTAMP:${utc(now)}`);
    if (allDay) {
      const day = e.start.replace(/-/g, "");
      const next = new Date(`${e.start}T00:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      lines.push(`DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${utc(next).slice(0, 8)}`);
    } else {
      lines.push(`DTSTART:${utc(new Date(e.start))}`);
    }
    lines.push(`SUMMARY:${escape(e.title)}`);
    if (e.location) lines.push(`LOCATION:${escape(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${escape(e.description)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
