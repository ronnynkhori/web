import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";

/** Title, canonical URL and language alternates for an inner page; `path` starts with "/". */
export function pageMetadata(locale: Locale, path: string, title: string, siteTitle: string, description?: string): Metadata {
  return {
    title: `${title} · ${siteTitle}`,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { en: `/en${path}`, pt: `/pt${path}`, fr: `/fr${path}`, "x-default": `/en${path}` },
    },
  };
}
