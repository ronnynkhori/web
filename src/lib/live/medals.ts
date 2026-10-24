import type { Localized } from "@/lib/i18n/config";
import { countries } from "@/data/countries";
import type { EventResultDoc, MedalAdjustmentDoc } from "@/lib/cms/types";
import type { MedalRow } from "./types";

interface Tally {
  gold: number;
  silver: number;
  bronze: number;
}

function tally(events: EventResultDoc[], adjustments: MedalAdjustmentDoc[]): Map<string, Tally> {
  const table = new Map<string, Tally>();
  const row = (code: string) => {
    let t = table.get(code);
    if (!t) table.set(code, (t = { gold: 0, silver: 0, bronze: 0 }));
    return t;
  };
  for (const event of events) {
    if (!event.medalEvent || !event.published) continue;
    for (const r of event.published) {
      if (r.rank === 1) row(r.countryCode).gold += 1;
      else if (r.rank === 2) row(r.countryCode).silver += 1;
      else if (r.rank === 3) row(r.countryCode).bronze += 1;
    }
  }
  for (const a of adjustments) {
    const t = row(a.countryCode);
    t.gold += a.gold;
    t.silver += a.silver;
    t.bronze += a.bronze;
  }
  return table;
}

function ranked(table: Map<string, Tally>): Array<Tally & { code: string; rank: number }> {
  const rows = [...table.entries()]
    .map(([code, t]) => ({ code, gold: Math.max(0, t.gold), silver: Math.max(0, t.silver), bronze: Math.max(0, t.bronze) }))
    .filter((r) => r.gold + r.silver + r.bronze > 0)
    .sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || a.code.localeCompare(b.code));
  // Equal medal counts share a rank (1, 2, 2, 4).
  let rank = 0;
  return rows.map((r, i) => {
    const prev = rows[i - 1];
    if (!prev || prev.gold !== r.gold || prev.silver !== r.silver || prev.bronze !== r.bronze) rank = i + 1;
    return { ...r, rank };
  });
}

/**
 * Medal table from published medal events (ranks 1-3) plus manual adjustments.
 * `previousRank` compares with the table before the most recently published event,
 * so the site can show who moved.
 */
export function computeMedals(events: EventResultDoc[], adjustments: MedalAdjustmentDoc[], names?: Map<string, Localized>): MedalRow[] {
  const current = ranked(tally(events, adjustments));
  const latest = [...events]
    .filter((e) => e.medalEvent && e.published)
    .sort((a, b) => (b._updatedAt ?? "").localeCompare(a._updatedAt ?? ""))[0];
  const before = latest ? ranked(tally(events.filter((e) => e !== latest), adjustments)) : current;
  const beforeRank = new Map(before.map((r) => [r.code, r.rank]));

  return current.map((r) => {
    return {
      countryCode: r.code,
      name: names?.get(r.code) ?? countries.find((c) => c.code === r.code)?.name ?? { en: r.code, pt: r.code, fr: r.code },
      gold: r.gold,
      silver: r.silver,
      bronze: r.bronze,
      total: r.gold + r.silver + r.bronze,
      rank: r.rank,
      previousRank: beforeRank.get(r.code) ?? current.length,
    };
  });
}
