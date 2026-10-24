import { fill, isLocale, type Locale } from "@/lib/i18n/config";
import { catalog } from "./catalog";

/** Cookie holding the Control Room language; the public site language is separate. */
export const ADMIN_LANG_COOKIE = "admin-lang";

/**
 * Translates an English UI string. The English text is the key, so anything
 * without a Portuguese or French entry yet still reads correctly in English.
 * `{name}` placeholders are filled from `vars`.
 */
export type Translate = (text: string, vars?: Record<string, string | number>) => string;

export function translator(locale: Locale): Translate {
  const table = locale === "pt" ? catalog.pt : undefined;
  return (text, vars) => {
    const out = table?.[text] ?? text;
    return vars ? fill(out, vars) : out;
  };
}

/** BCP 47 tag for Intl date and number formatting in the Control Room. */
export const intlLocale = (locale: Locale) => ({ en: "en-GB", pt: "pt-PT", fr: "fr-FR" })[locale];

export const adminLocaleFrom = (value: string | undefined): Locale | undefined => (value && isLocale(value) ? value : undefined);

/** Best match from an Accept-Language header, for staff who have not picked a language yet. */
export function localeFromHeader(header: string | null): Locale {
  const ranked = (header ?? "")
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return (ranked.find((r) => isLocale(r.lang))?.lang as Locale | undefined) ?? "pt";
}
