/**
 * DEMO results provider. Deterministic: the same `tick` always yields the same
 * snapshot, so the server stays stateless and polling clients see believable,
 * bounded changes (scores tick up, medal ranks shift occasionally).
 */
import { DEMO, demoCountryNames, demoMatches, demoMedalBase, demoResults } from "@/data/live-demo";
import type { LiveSnapshot, Match, MedalRow, ResultsProvider, TimelineEvent } from "./types";

/** Demo world advances one step every 20 seconds. */
export const DEMO_TICK_MS = 20_000;
const MATCH_CYCLE = 24;
const MEDAL_CYCLE = 40;

function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function advanceMatch(match: Match, phase: number): Match {
  if (match.status !== "live") return match;
  const m: Match = structuredClone(match);

  if (m.sportId === "football" && m.minute !== null) {
    const extra: TimelineEvent[] = [];
    for (let p = 1; p <= phase; p++) {
      if (rand(p * 3.1) > 0.84) {
        const sideKey = rand(p * 5.7) > 0.5 ? "home" : "away";
        m[sideKey].score += 1;
        extra.unshift({ id: `g${p}`, minute: Math.min(90, m.minute + p), kind: "goal", side: sideKey });
      } else if (rand(p * 9.3) > 0.92) {
        extra.unshift({ id: `y${p}`, minute: Math.min(90, m.minute + p), kind: "yellow", side: rand(p) > 0.5 ? "home" : "away" });
      }
    }
    m.minute = Math.min(90, m.minute + phase);
    m.timeline = [...extra, ...m.timeline];
  } else {
    for (let p = 1; p <= phase; p++) {
      m.home.score += Math.floor(rand(p * 1.3) * 4);
      m.away.score += Math.floor(rand(p * 2.9) * 4);
    }
  }
  return m;
}

function medalTable(step: number): MedalRow[] {
  const rows = demoMedalBase.map(([code, gold, silver, bronze]) => ({ code, gold, silver, bronze }));
  for (let t = 1; t <= step; t++) {
    const row = rows[Math.floor(rand(t * 7.7) * rows.length)];
    const kind = Math.floor(rand(t * 3.3) * 3);
    if (kind === 0) row.gold += 1;
    else if (kind === 1) row.silver += 1;
    else row.bronze += 1;
  }
  return rows
    .sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || a.code.localeCompare(b.code))
    .map((r, i) => ({
      countryCode: r.code,
      name: demoCountryNames[r.code],
      gold: r.gold,
      silver: r.silver,
      bronze: r.bronze,
      total: r.gold + r.silver + r.bronze,
      rank: i + 1,
      previousRank: i + 1,
    }));
}

export function createDemoSnapshot(tick: number, updatedAt: string | null): LiveSnapshot {
  const phase = tick % MATCH_CYCLE;
  const step = tick % MEDAL_CYCLE;
  const medals = medalTable(step);
  const previous = medalTable(Math.max(0, step - 1));
  const prevRank = new Map(previous.map((r) => [r.countryCode, r.rank]));

  return {
    updatedAt,
    status: "ok",
    ...DEMO,
    matches: demoMatches.map((m) => advanceMatch(m, phase)),
    medals: medals.map((r) => ({ ...r, previousRank: prevRank.get(r.countryCode) ?? r.rank })),
    results: demoResults,
  };
}

/** Baseline used for the static server render (no clock access while prerendering). */
export const demoBaseline: LiveSnapshot = createDemoSnapshot(0, null);

export class DemoResultsProvider implements ResultsProvider {
  readonly id = "demo";
  async getSnapshot(): Promise<LiveSnapshot> {
    const now = Date.now();
    return createDemoSnapshot(Math.floor(now / DEMO_TICK_MS), new Date(now).toISOString());
  }
}
