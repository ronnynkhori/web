import type { Localized } from "@/lib/i18n/config";

export type EventStatus = "upcoming" | "live" | "finished" | "postponed" | "cancelled";

export interface MatchSide {
  countryCode: string;
  name: Localized;
  score: number;
}

export type TimelineKind = "goal" | "yellow" | "red" | "point" | "period";

export interface TimelineEvent {
  id: string;
  minute: number;
  kind: TimelineKind;
  side: "home" | "away";
}

export interface SetScore {
  home: number;
  away: number;
}

export interface Match {
  id: string;
  sportId: string;
  sport: Localized;
  round: Localized;
  /** Scheduled start (ISO date-time), shown on upcoming fixtures. */
  startsAt?: string;
  venue?: Localized;
  status: EventStatus;
  /** Match minute for timed sports; null when not applicable. */
  minute: number | null;
  home: MatchSide;
  away: MatchSide;
  timeline: TimelineEvent[];
  /** Set sports: points of each completed set; `home.score`/`away.score` count sets won. */
  sets?: SetScore[];
  /** Set sports: points in the set being played. */
  setPoints?: SetScore;
  corrected?: boolean;
}

export interface MedalRow {
  countryCode: string;
  name: Localized;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  rank: number;
  previousRank: number;
}

export interface ResultRow {
  id: string;
  sportId: string;
  event: Localized;
  rank: number;
  athlete: Localized;
  countryCode: string;
  country: Localized;
  result: string;
  notes: Localized | null;
  winner: boolean;
  corrected?: boolean;
}

/** Everything a live surface needs. Real feeds must fill the same shape. */
export interface LiveSnapshot {
  updatedAt: string | null;
  status: "ok" | "error";
  isDemo: boolean;
  matches: Match[];
  medals: MedalRow[];
  results: ResultRow[];
}

/** One interface for scores, standings, medals and timelines (handoff §5). */
export interface ResultsProvider {
  readonly id: string;
  getSnapshot(): Promise<LiveSnapshot>;
}
