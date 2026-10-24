/**
 * Countries - the nine CPLP member states (the flags in the official emblem).
 * Delegation sizes and sports entered are [CONTENT REQUIRED].
 * Flags: national flag SVGs from the open-source flag-icons set (MIT,
 * github.com/lipis/flag-icons), 4:3 artboards.
 */
import { CONTENT_REQUIRED } from "@/lib/content";
import type { Localized } from "@/lib/i18n/config";
import type { Country, ImageAsset } from "./types";

const pending = { delegationSize: CONTENT_REQUIRED, sportsEntered: CONTENT_REQUIRED, isDemo: true } as const;

const FLAG_CREDIT = "flag-icons (MIT)";

function flagOf(code: string, name: Localized): ImageAsset {
  return {
    src: `/images/flags/${code.toLowerCase()}.svg`,
    width: 640,
    height: 480,
    alt: { en: `Flag of ${name.en}`, pt: `Bandeira de ${name.pt}` },
    credit: FLAG_CREDIT,
  };
}

const base: Omit<Country, "flag">[] = [
  { code: "AGO", name: { en: "Angola", pt: "Angola" }, isHost: true, membership: "confirmed", ...pending },
  { code: "BRA", name: { en: "Brazil", pt: "Brasil" }, membership: "confirmed", ...pending },
  { code: "CPV", name: { en: "Cabo Verde", pt: "Cabo Verde" }, membership: "confirmed", ...pending },
  { code: "GNB", name: { en: "Guinea-Bissau", pt: "Guiné-Bissau" }, membership: "confirmed", ...pending },
  { code: "GNQ", name: { en: "Equatorial Guinea", pt: "Guiné Equatorial" }, membership: "confirmed", ...pending },
  { code: "MOZ", name: { en: "Mozambique", pt: "Moçambique" }, membership: "confirmed", ...pending },
  { code: "PRT", name: { en: "Portugal", pt: "Portugal" }, membership: "confirmed", ...pending },
  { code: "STP", name: { en: "São Tomé and Príncipe", pt: "São Tomé e Príncipe" }, membership: "confirmed", ...pending },
  { code: "TLS", name: { en: "Timor-Leste", pt: "Timor-Leste" }, membership: "confirmed", ...pending },
];

export const countries: Country[] = base.map((c) => ({ ...c, flag: flagOf(c.code, c.name) }));

export function getCountry(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}
