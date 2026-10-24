import { competitionStart, gamesDays, gamesEnd, gamesStart } from "@/data/event";

/** Where the Games are in their calendar; drives section order and the hero. */
export type Phase = "pre" | "live" | "post";
export const phases: readonly Phase[] = ["pre", "live", "post"];

/**
 * Forces a phase for every visitor; null lets the real date decide.
 * Demo any phase with /en?phase=live (check:release flags a non-null value).
 */
export const DEMO_PHASE: Phase | null = null;
/** The Games day shown when a phase is forced to "live". */
export const DEMO_GAME_DAY = 3;

export function isPhase(value: unknown): value is Phase {
  return typeof value === "string" && (phases as readonly string[]).includes(value);
}

export function getPhase(now: Date): Phase {
  const t = now.getTime();
  if (t < Date.parse(competitionStart)) return "pre";
  if (t <= Date.parse(gamesEnd)) return "live";
  return "post";
}

/** "Day 3 of 10" during the Games (1-based, clamped; early competition on 3 Dec counts as day 1). */
export function gameDay(now: Date): { day: number; total: number } {
  const day = Math.floor((now.getTime() - Date.parse(gamesStart)) / 86_400_000) + 1;
  return { day: Math.min(gamesDays, Math.max(1, day)), total: gamesDays };
}
