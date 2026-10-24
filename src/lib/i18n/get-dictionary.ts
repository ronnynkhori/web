import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./messages/en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  pt: () => import("./messages/pt").then((m) => m.default),
  en: () => import("./messages/en").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

export type { Dictionary };
