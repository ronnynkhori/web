export const locales = ["pt", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt";

export const localeNames: Record<Locale, string> = {
  pt: "Português",
  en: "English",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Content that differs per locale. Every user-facing data string uses this shape.
 * `fr` is accepted (and ignored) so legacy entries type-check while they are rewritten.
 */
export type Localized<T = string> = Record<Locale, T> & { fr?: T };

const blank = (v: unknown) => v == null || v === "" || (Array.isArray(v) && v.length === 0);

/** Untranslated (empty) values fall back to Portuguese, then English. */
export function pick<T>(value: Localized<T>, locale: Locale): T {
  if (!blank(value[locale])) return value[locale];
  return blank(value.pt) ? value.en : value.pt;
}

/** Minimal ICU-free interpolation: fill("Up {n}", { n: 2 }) -> "Up 2". */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}
