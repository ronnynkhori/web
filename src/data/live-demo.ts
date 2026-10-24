/**
 * DEMO seed for the live/results layer, for the proposal. None of this is
 * real. Every surface rendering it shows a DEMO marker.
 */
import type { Localized } from "@/lib/i18n/config";
import type { Match, ResultRow } from "@/lib/live/types";

export const DEMO = { isDemo: true } as const;

const n = (en: string, pt: string = en): Localized => ({ en, pt });

export const demoCountryNames: Record<string, Localized> = {
  AGO: n("Angola"),
  BRA: n("Brazil", "Brasil"),
  CPV: n("Cabo Verde"),
  GNB: n("Guinea-Bissau", "Guiné-Bissau"),
  GNQ: n("Equatorial Guinea", "Guiné Equatorial"),
  MOZ: n("Mozambique", "Moçambique"),
  PRT: n("Portugal"),
  STP: n("São Tomé and Príncipe", "São Tomé e Príncipe"),
  TLS: n("Timor-Leste"),
};

const side = (code: string, score: number) => ({ countryCode: code, name: demoCountryNames[code], score });

export const demoMatches: Match[] = [
  {
    id: "demo-football-a",
    sportId: "football",
    sport: n("Football", "Futebol"),
    round: n("Group A", "Grupo A"),
    status: "live",
    minute: 67,
    home: side("AGO", 2),
    away: side("PRT", 1),
    timeline: [
      { id: "t3", minute: 67, kind: "goal", side: "home" },
      { id: "t2", minute: 54, kind: "yellow", side: "away" },
      { id: "t1", minute: 31, kind: "goal", side: "away" },
    ],
  },
  {
    id: "demo-3x3",
    sportId: "basketball-3x3",
    sport: n("3x3 Basketball", "Basquetebol 3x3"),
    round: n("Pool B", "Grupo B"),
    status: "finished",
    minute: null,
    home: side("CPV", 21),
    away: side("MOZ", 17),
    timeline: [],
  },
  {
    id: "demo-3x3-live",
    sportId: "basketball-3x3",
    sport: n("3x3 Basketball", "Basquetebol 3x3"),
    round: n("Pool A", "Grupo A"),
    status: "live",
    minute: null,
    home: side("BRA", 14),
    away: side("STP", 11),
    timeline: [],
  },
  {
    id: "demo-tennis",
    sportId: "tennis",
    sport: n("Tennis", "Ténis"),
    round: n("Singles · quarter-final", "Singulares · quartos de final"),
    status: "finished",
    minute: null,
    home: side("PRT", 2),
    away: side("GNQ", 0),
    timeline: [],
    sets: [
      { home: 6, away: 3 },
      { home: 6, away: 4 },
    ],
  },
  {
    id: "demo-football-b",
    sportId: "football",
    sport: n("Football", "Futebol"),
    round: n("Group B", "Grupo B"),
    startsAt: "2027-03-22T15:00:00.000Z",
    venue: n("Coqueiros Stadium", "Estádio dos Coqueiros"),
    status: "upcoming",
    minute: null,
    home: side("BRA", 0),
    away: side("MOZ", 0),
    timeline: [],
  },
  {
    id: "demo-football-c",
    sportId: "football",
    sport: n("Football", "Futebol"),
    round: n("Group A", "Grupo A"),
    startsAt: "2027-03-22T17:30:00.000Z",
    venue: n("Coqueiros Stadium", "Estádio dos Coqueiros"),
    status: "upcoming",
    minute: null,
    home: side("GNB", 0),
    away: side("TLS", 0),
    timeline: [],
  },
];

/** Base medal counts (G, S, B). */
export const demoMedalBase: Array<[code: string, g: number, s: number, b: number]> = [
  ["BRA", 14, 10, 8],
  ["PRT", 11, 9, 9],
  ["AGO", 9, 8, 7],
  ["MOZ", 6, 7, 8],
  ["CPV", 4, 5, 6],
  ["STP", 2, 3, 4],
  ["GNB", 1, 3, 4],
  ["GNQ", 1, 2, 3],
  ["TLS", 0, 1, 3],
];

const sprint = n("Athletics · 100 m boys final", "Atletismo · Final 100 m masculinos");
const lap = n("Athletics · 400 m girls final", "Atletismo · Final 400 m femininos");
const wheel = n("Para athletics · 100 m wheelchair final", "Atletismo adaptado · Final 100 m cadeira de rodas");
const kata = n("Karate · kata girls final", "Karaté · Final kata femininos");
const tkd = n("Taekwondo · −49 kg girls final", "Taekwondo · Final −49 kg femininos");
/** Fictional dummy names - never real youth athletes (safeguarding). */
const athlete = (name: string) => n(name, name);
const c = demoCountryNames;

export const demoResults: ResultRow[] = [
  { id: "r1", sportId: "athletics", event: sprint, rank: 1, athlete: athlete("J. Silva"), countryCode: "BRA", country: c.BRA, result: "10.84", notes: null, winner: true },
  { id: "r2", sportId: "athletics", event: sprint, rank: 2, athlete: athlete("M. Cassoma"), countryCode: "AGO", country: c.AGO, result: "10.91", notes: null, winner: false },
  { id: "r3", sportId: "athletics", event: sprint, rank: 3, athlete: athlete("T. Mondlane"), countryCode: "MOZ", country: c.MOZ, result: "11.02", notes: null, winner: false },
  { id: "r4", sportId: "athletics", event: lap, rank: 1, athlete: athlete("A. Ferreira"), countryCode: "PRT", country: c.PRT, result: "53.40", notes: null, winner: true },
  { id: "r5", sportId: "athletics", event: lap, rank: 2, athlete: athlete("D. Tavares"), countryCode: "CPV", country: c.CPV, result: "54.12", notes: null, winner: false },
  { id: "r6", sportId: "para-athletics", event: wheel, rank: 1, athlete: athlete("P. Neto"), countryCode: "AGO", country: c.AGO, result: "16.92", notes: null, winner: true },
  { id: "r7", sportId: "karate", event: kata, rank: 1, athlete: athlete("R. Costa"), countryCode: "PRT", country: c.PRT, result: "26.4", notes: n("Final", "Final"), winner: true },
  { id: "r8", sportId: "karate", event: kata, rank: 2, athlete: athlete("L. Santos"), countryCode: "BRA", country: c.BRA, result: "25.9", notes: null, winner: false },
  { id: "r9", sportId: "taekwondo", event: tkd, rank: 1, athlete: athlete("E. Bento"), countryCode: "AGO", country: c.AGO, result: "12–7", notes: null, winner: true },
  { id: "r10", sportId: "taekwondo", event: tkd, rank: 2, athlete: athlete("S. Ximenes"), countryCode: "TLS", country: c.TLS, result: "7–12", notes: null, winner: false },
];
