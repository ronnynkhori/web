import { intlLocale, translator, type Translate } from "@/lib/admin/i18n/translate";
import type { Locale } from "@/lib/i18n/config";

const zone = "Africa/Luanda";
const english = translator("en");

/** The Intl tag for the language `t` speaks; the catalogues map "en-GB" to "pt-PT" / "fr-FR". */
const tagOf = (t: Translate) => t("en-GB");

export function relativeTime(iso: string | undefined, t: Translate = english, now = Date.now()): string {
  if (!iso) return "";
  const diff = Math.round((now - Date.parse(iso)) / 1000);
  if (diff < 60) return t("just now");
  if (diff < 3600) return t("{n} min ago", { n: Math.floor(diff / 60) });
  if (diff < 86_400) return t("{n} h ago", { n: Math.floor(diff / 3600) });
  return new Intl.DateTimeFormat(tagOf(t), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: zone }).format(new Date(iso));
}

const kickoffOptions: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: zone,
};

const stampOptions: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: zone,
};

export const kickoffFormat = new Intl.DateTimeFormat("en-GB", kickoffOptions);
export const stampFormat = new Intl.DateTimeFormat("en-GB", stampOptions);

/** Kick-off times in the Control Room language. */
export const kickoffFormatFor = (locale: Locale) => new Intl.DateTimeFormat(intlLocale(locale), kickoffOptions);
/** Activity-log timestamps in the Control Room language. */
export const stampFormatFor = (locale: Locale) => new Intl.DateTimeFormat(intlLocale(locale), stampOptions);

/** "rnkhori" from "rnkhori@example.org", for compact activity lines. */
export const shortName = (email: string | undefined, t: Translate = english) => (email ? email.split("@")[0] : t("unknown"));

export const initials = (name: string) =>
  name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
