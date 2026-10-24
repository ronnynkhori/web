/**
 * Sponsors. [CONTENT REQUIRED] sponsor names, tiers and logos as supplied by
 * the client. Lockups follow the CI partnership rule: Games logo + vertical
 * hairline + partner logo, equal visual weight.
 */
import type { SponsorTier } from "./types";

export const sponsorTiers: SponsorTier[] = [
  { id: "principal", slots: 3 },
  { id: "official", slots: 6 },
  { id: "supporters", slots: 6 },
];
