/**
 * Partners and sponsors, confirmed by the client (25 Oct 2026): MINJUD as
 * institutional partner and Ondaka as official marketing and communications
 * agency. Further sponsors are added from the Control Room. Lockups follow the
 * CI partnership rule: Games logo + vertical hairline + partner logo, equal
 * visual weight.
 */
import type { SponsorDoc } from "@/lib/cms/types";
import type { SponsorTier } from "./types";

export const sponsorTiers: SponsorTier[] = [
  { id: "institutional", slots: 1 },
  { id: "agency", slots: 1 },
  { id: "principal", slots: 3 },
  { id: "official", slots: 6 },
  { id: "supporters", slots: 6 },
];

/** Tiers shown side by side as large single-logo cards. */
export const featuredTiers = new Set<SponsorTier["id"]>(["institutional", "agency"]);

export const partners: SponsorDoc[] = [
  {
    id: "minjud",
    name: "MINJUD · Ministério da Juventude e Desportos",
    tier: "institutional",
    logo: { src: "/images/brand/minjud-h.png", width: 900, height: 192, alt: { en: "Ministry of Youth and Sports (MINJUD)", pt: "Ministério da Juventude e Desportos (MINJUD)" } },
    url: "https://minjud.gov.ao",
  },
  {
    id: "ondaka",
    name: "Ondaka",
    tier: "agency",
    logo: { src: "/images/brand/ondaka-h.png", width: 805, height: 198, alt: { en: "Ondaka", pt: "Ondaka" } },
  },
];
