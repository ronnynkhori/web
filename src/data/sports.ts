/**
 * Sports of the XIII CPLP Games: the nine sports in the official brand book
 * (OFFICIAL BRAND XIII CPLP, "Mascote de cada modalidade"). Competition
 * venues, accommodation and participant numbers come from the client's venue
 * table (Ondaka, 25 Oct 2026). Days inside 25 March to 3 April, quotas and
 * eligibility are a provisional proposal ([CLIENT TO CONFIRM]).
 * Photos: DEMO stand-ins (src/data/demo/images.ts).
 */
import type { Localized } from "@/lib/i18n/config";
import { demoImages as img } from "./demo/images";
import { mascotPoses } from "./mascot";
import type { Sport } from "./types";

const t = (en: string, pt: string): Localized => ({ en, pt });
const DAY = 86_400_000;
/** ISO dates for "MM-DD" days in 2027. */
const on = (...days: string[]) => days.map((d) => `2027-${d}`);
/** Every ISO date from one "MM-DD" day to another, inclusive (crosses month ends). */
const span = (from: string, to: string) => {
  const out: string[] = [];
  for (let ms = Date.parse(`2027-${from}T00:00:00Z`); ms <= Date.parse(`2027-${to}T00:00:00Z`); ms += DAY) {
    out.push(new Date(ms).toISOString().slice(0, 10));
  }
  return out;
};

const youth = (from: number, to: number) =>
  t(
    `Born between 1 January ${from} and 31 December ${to} (provisional).`,
    `Nascidos entre 1 de Janeiro de ${from} e 31 de Dezembro de ${to} (provisório).`,
  );

const athleticsTotal = { n: 192, group: t("Athletics, including para athletics", "Atletismo, incluindo atletismo adaptado") };
const combatTotal = { n: 192, group: t("Combat sports: karate and taekwondo", "Lutas: karaté e taekwondo") };
const ilhaMar = t("Ilha Mar", "Ilha Mar");

export const sports: Sport[] = [
  {
    id: "athletics",
    name: t("Athletics", "Atletismo"),
    category: "track",
    status: "confirmed",
    tone: "energy",
    image: img.athletics,
    mascot: mascotPoses.athletics,
    programme: {
      days: span("03-28", "03-31"),
      venues: ["sayovo"],
      lodging: t("Sayovo, Bengo", "Sayovo, Bengo"),
      participants: athleticsTotal,
      eligibility: youth(2009, 2010),
      quota: { men: 8, women: 8, staff: 4, judges: 1, total: 21 },
      broadcast: "live",
    },
  },
  {
    id: "para-athletics",
    name: t("Para athletics", "Atletismo adaptado"),
    category: "track",
    status: "confirmed",
    tone: "region",
    image: img.paraAthletics,
    mascot: mascotPoses.paraAthletics,
    programme: {
      days: span("03-29", "03-31"),
      venues: ["sayovo"],
      lodging: t("Sayovo, Bengo", "Sayovo, Bengo"),
      participants: athleticsTotal,
      eligibility: youth(2007, 2010),
      quota: { men: 4, women: 4, staff: 3, judges: 1, total: 12 },
      broadcast: "live-delayed",
      note: t(
        "Wheelchair racing and classes for visually impaired athletes (provisional programme).",
        "Corrida em cadeira de rodas e classes para atletas com deficiência visual (programa provisório).",
      ),
    },
  },
  {
    id: "basketball-3x3",
    name: t("3x3 Basketball", "Basquetebol 3x3"),
    category: "court",
    status: "confirmed",
    tone: "highlight",
    image: img.basketball,
    mascot: mascotPoses.basketball,
    programme: {
      days: span("03-26", "03-29"),
      venues: ["marginal-luanda"],
      lodging: ilhaMar,
      participants: { n: 112 },
      eligibility: youth(2009, 2010),
      quota: { men: 4, women: 4, staff: 2, judges: 1, total: 11 },
      broadcast: "live-semis",
    },
  },
  {
    id: "football",
    name: t("Football", "Futebol"),
    category: "team",
    status: "confirmed",
    tone: "premium",
    image: img.football,
    mascot: mascotPoses.football,
    programme: {
      days: on("03-26", "03-27", "03-28", "03-30", "03-31", "04-01"),
      rest: on("03-29"),
      venues: ["afa"],
      lodging: t("Futungo", "Futungo"),
      participants: { n: 184 },
      eligibility: youth(2009, 2010),
      quota: { men: 18, women: 0, staff: 5, judges: 1, total: 24 },
      broadcast: "live-delayed",
    },
  },
  {
    id: "karate",
    name: t("Karate", "Karaté"),
    category: "combat",
    status: "confirmed",
    tone: "energy",
    image: img.karate,
    mascot: mascotPoses.karate,
    programme: {
      days: span("03-31", "04-01"),
      venues: ["pavilhao-cidadela"],
      lodging: t("Zongo / Vila Alice", "Zongo / Vila Alice"),
      participants: combatTotal,
      eligibility: youth(2009, 2011),
      quota: { men: 6, women: 6, staff: 2, judges: 2, total: 16 },
      broadcast: "live-delayed",
    },
  },
  {
    id: "taekwondo",
    name: t("Taekwondo", "Taekwondo"),
    category: "combat",
    status: "confirmed",
    tone: "region",
    image: img.taekwondo,
    mascot: mascotPoses.taekwondo,
    programme: {
      days: span("03-27", "03-28"),
      venues: ["pavilhao-cidadela"],
      lodging: t("Zongo / Vila Alice", "Zongo / Vila Alice"),
      participants: combatTotal,
      eligibility: youth(2009, 2011),
      quota: { men: 6, women: 6, staff: 2, judges: 2, total: 16 },
      broadcast: "eng",
    },
  },
  {
    id: "tennis",
    name: t("Tennis", "Ténis"),
    category: "racket",
    status: "confirmed",
    tone: "highlight",
    image: img.tennis,
    mascot: mascotPoses.tennis,
    programme: {
      days: span("03-26", "04-01"),
      venues: ["kikuchi"],
      lodging: t("Academia Diplomática", "Academia Diplomática"),
      participants: { n: 56 },
      eligibility: youth(2009, 2011),
      quota: { men: 2, women: 2, staff: 1, judges: 1, total: 6 },
      broadcast: "eng",
    },
  },
  {
    id: "beach-volleyball",
    name: t("Beach volleyball", "Voleibol de praia"),
    category: "beach",
    status: "confirmed",
    tone: "premium",
    image: img.beachVolleyball,
    mascot: mascotPoses.beachVolleyball,
    programme: {
      days: span("03-26", "03-31"),
      venues: ["praia-ilha-luanda"],
      lodging: ilhaMar,
      participants: { n: 64 },
      eligibility: youth(2009, 2010),
      quota: { men: 2, women: 2, staff: 1, judges: 1, total: 6 },
      broadcast: "live-semis",
    },
  },
  {
    id: "chess",
    name: t("Chess", "Xadrez"),
    category: "mind",
    status: "confirmed",
    tone: "energy",
    image: img.chess,
    mascot: mascotPoses.chess,
    programme: {
      days: span("03-27", "04-02"),
      venues: ["pavilhao-cidadela"],
      lodging: t("Hotel Vila Alice", "Hotel Vila Alice"),
      participants: { n: 40 },
      eligibility: youth(2009, 2012),
      quota: { men: 2, women: 2, staff: 1, judges: 1, total: 6 },
      broadcast: "eng",
    },
  },
];

export function getSport(id: string): Sport | undefined {
  return sports.find((s) => s.id === id);
}

/** Every day from the opening ceremony (25 March) to the closing (3 April). */
export const competitionDays = span("03-25", "04-03");

/** Participants across the Games, counting each shared total once (840 in the client's table). */
export const totalParticipants = [
  ...new Map(sports.map((s) => s.programme?.participants).filter((p) => p !== undefined).map((p) => [p.group?.en ?? p, p.n])).values(),
].reduce((sum, n) => sum + n, 0);
