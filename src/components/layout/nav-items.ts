import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  /** Shown inline from desktop (1024px); others move into "More" until large (1440px). */
  primary: boolean;
}

/** [CLIENT TO CONFIRM] navigation labels and order (component-specifications §2). */
export function getNavItems(dict: Dictionary, locale: Locale): NavItem[] {
  const item = (id: keyof Dictionary["nav"], anchor: string, primary: boolean): NavItem => ({
    id: anchor,
    label: dict.nav[id],
    href: `/${locale}#${anchor}`,
    primary,
  });
  return [
    item("games", "games", false),
    item("mascot", "mascot", true),
    item("sports", "sports", true),
    item("live", "live", true),
    item("results", "results", true),
    item("countries", "countries", false),
    item("venues", "venues", false),
    item("news", "news", true),
    item("media", "media", false),
    item("guide", "guide", true),
  ];
}
