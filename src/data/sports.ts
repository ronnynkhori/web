/**
 * Sports of the XIII CPLP Games: the seven sports illustrated by the official
 * mascot artwork. Days, venues, quotas and eligibility are a provisional
 * proposal ([CLIENT TO CONFIRM] by the Organising Committee).
 * Photos: DEMO stand-ins (src/data/demo/images.ts).
 */
import type { Localized } from "@/lib/i18n/config";
import { demoImages as img } from "./demo/images";
import { mascotPoses } from "./mascot";
import type { Sport } from "./types";

const t = (en: string, pt: string): Localized => ({ en, pt });
const jul = (...days: number[]) => days.map((d) => `2027-07-${String(d).padStart(2, "0")}`);
const range = (from: number, to: number) => jul(...Array.from({ length: to - from + 1 }, (_, i) => from + i));

const youth = (from: number, to: number) =>
  t(
    `Born between 1 January ${from} and 31 December ${to} (provisional).`,
    `Nascidos entre 1 de Janeiro de ${from} e 31 de Dezembro de ${to} (provisório).`,
  );

export const sports: Sport[] = [
  {
    id: "athletics",
    name: t("Athletics", "Atletismo"),
    category: "track",
    status: "source",
    tone: "energy",
    image: img.trackRace,
    mascot: mascotPoses.athletics,
    programme: {
      days: range(19, 23),
      venues: ["estadio-11-novembro"],
      eligibility: youth(2010, 2011),
      quota: { men: 8, women: 8, staff: 4, judges: 1, total: 21 },
      broadcast: "live",
    },
  },
  {
    id: "para-athletics",
    name: t("Para athletics", "Atletismo adaptado"),
    category: "track",
    status: "source",
    tone: "region",
    image: img.runnerSunset,
    mascot: mascotPoses.paraAthletics,
    programme: {
      days: range(20, 22),
      venues: ["estadio-11-novembro"],
      eligibility: youth(2008, 2011),
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
    status: "source",
    tone: "highlight",
    image: img.basketballSunset,
    mascot: mascotPoses.basketball,
    programme: {
      days: range(18, 21),
      venues: ["marginal-luanda"],
      eligibility: youth(2010, 2011),
      quota: { men: 4, women: 4, staff: 2, judges: 1, total: 11 },
      broadcast: "live-semis",
    },
  },
  {
    id: "football",
    name: t("Football", "Futebol"),
    category: "team",
    status: "source",
    tone: "energy",
    image: img.footballKick,
    mascot: mascotPoses.football,
    programme: {
      days: jul(18, 19, 20, 22, 23, 24),
      rest: jul(21),
      venues: ["estadio-coqueiros"],
      eligibility: youth(2010, 2011),
      quota: { men: 18, women: 0, staff: 5, judges: 1, total: 24 },
      broadcast: "live-delayed",
    },
  },
  {
    id: "karate",
    name: t("Karate", "Karaté"),
    category: "combat",
    status: "source",
    tone: "premium",
    image: img.martialSunset,
    mascot: mascotPoses.karate,
    programme: {
      days: range(22, 23),
      venues: ["pavilhao-cidadela"],
      eligibility: youth(2010, 2012),
      quota: { men: 6, women: 6, staff: 2, judges: 2, total: 16 },
      broadcast: "live-delayed",
    },
  },
  {
    id: "taekwondo",
    name: t("Taekwondo", "Taekwondo"),
    category: "combat",
    status: "source",
    tone: "highlight",
    image: img.sportTaekwondo,
    mascot: mascotPoses.taekwondo,
    programme: {
      days: range(19, 20),
      venues: ["pavilhao-cidadela"],
      eligibility: youth(2010, 2012),
      quota: { men: 6, women: 6, staff: 2, judges: 2, total: 16 },
      broadcast: "eng",
    },
  },
  {
    id: "tennis",
    name: t("Tennis", "Ténis"),
    category: "racket",
    status: "source",
    tone: "region",
    image: img.athleteYellow,
    mascot: mascotPoses.tennis,
    programme: {
      days: range(18, 24),
      venues: ["clube-tenis-luanda"],
      eligibility: youth(2010, 2012),
      quota: { men: 2, women: 2, staff: 1, judges: 1, total: 6 },
      broadcast: "eng",
    },
  },
];

export function getSport(id: string): Sport | undefined {
  return sports.find((s) => s.id === id);
}

/** Every day with competition or the ceremonies, 17-25 July (provisional). */
export const competitionDays = range(17, 25);
