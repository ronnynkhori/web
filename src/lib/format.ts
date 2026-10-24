import type { Locale } from "@/lib/i18n/config";

/** All event times are shown in Luanda time (tokens.i18n.timezone). */
export const EVENT_TIME_ZONE = "Africa/Luanda";
export const EVENT_TIME_ZONE_LABEL = "WAT, UTC+1";

const intlLocale: Record<Locale, string> = { en: "en-GB", pt: "pt-PT" };

/** EN "4 Dec 2026" · PT "4 de Dezembro de 2026" (tokens.i18n.dateFormat). */
export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (locale === "pt") {
    const parts = new Intl.DateTimeFormat(intlLocale.pt, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: EVENT_TIME_ZONE,
    }).formatToParts(date);
    const day = parts.find((p) => p.type === "day")?.value;
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const year = parts.find((p) => p.type === "year")?.value;
    return `${day} de ${month.charAt(0).toUpperCase()}${month.slice(1)} de ${year}`;
  }
  return new Intl.DateTimeFormat(intlLocale.en, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: EVENT_TIME_ZONE,
  }).format(date);
}

/** Short day + month for compact UI: EN "4 Dec" · PT "4 Dez". */
export function formatDayMonth(iso: string, locale: Locale): string {
  const out = new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "short",
    timeZone: EVENT_TIME_ZONE,
  }).format(new Date(iso));
  return out.replace(".", "");
}

/** Time always carries the timezone label (content-rules §4). */
export function formatTime(iso: string, locale: Locale): string {
  const time = new Intl.DateTimeFormat(intlLocale[locale], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: EVENT_TIME_ZONE,
  }).format(new Date(iso));
  return `${time} ${EVENT_TIME_ZONE_LABEL.split(",")[0]}`;
}

/** Locale-aware number formatting (PT uses a different thousands separator). */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale]).format(value);
}

export function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}
