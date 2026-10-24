import type { Match, SetScore } from "./types";

/** How each sport is scored on the score desk. Shared by the server and the phone UI. */
export type ScoreTemplate = "goals" | "points" | "sets";

interface SportScoring {
  template: ScoreTemplate;
  /** Quick-add buttons per side. */
  steps: number[];
  /** Timed sports show a match minute. */
  timed: boolean;
}

const scoring: Record<string, SportScoring> = {
  football: { template: "goals", steps: [1], timed: true },
  basketball: { template: "points", steps: [1, 2, 3], timed: false },
  "basketball-3x3": { template: "points", steps: [1, 2], timed: false },
  netball: { template: "points", steps: [1], timed: false },
  volleyball: { template: "sets", steps: [1], timed: false },
  "beach-volleyball": { template: "sets", steps: [1], timed: false },
  esport: { template: "points", steps: [1], timed: false },
};

/** Sports played as head-to-head matches (the rest publish ranked event results). */
export const matchSportIds = Object.keys(scoring);

export function scoringFor(sportId: string): SportScoring {
  return scoring[sportId] ?? { template: "points", steps: [1], timed: false };
}

type Side = "home" | "away";

/** Adds (or with a negative `n`, removes) points in the set being played. */
export function addSetPoint(match: Match, side: Side, n: number): Match {
  const current = match.setPoints ?? { home: 0, away: 0 };
  const setPoints = { ...current, [side]: Math.max(0, current[side] + n) };
  return { ...match, setPoints, status: match.status === "upcoming" && n > 0 ? "live" : match.status };
}

/** Closes the set in play and gives it to the side ahead. Null while the set is level. */
export function endSet(match: Match): Match | null {
  const p = match.setPoints;
  if (!p || p.home === p.away) return null;
  const winner: Side = p.home > p.away ? "home" : "away";
  return {
    ...match,
    sets: [...(match.sets ?? []), p],
    setPoints: { home: 0, away: 0 },
    [winner]: { ...match[winner], score: match[winner].score + 1 },
  };
}

/** Keeps only well-formed set scores (server-side clean-up of desk input). */
export function cleanSets(value: unknown, max = 7): SetScore[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.slice(0, max).map(cleanSet);
}

export function cleanSet(value: unknown): SetScore {
  const v = (value ?? {}) as Partial<SetScore>;
  const n = (x: unknown) => Math.max(0, Math.min(99, Math.round(Number(x) || 0)));
  return { home: n(v.home), away: n(v.away) };
}

export const scoreUnit: Record<ScoreTemplate, string> = {
  goals: "Goal",
  points: "Points",
  sets: "Set",
};
