/**
 * Event facts for the XIII Jogos Desportivos da CPLP.
 * Confirmed: name, edition and "Angola 2027" (official dated logo variants).
 * Everything else (city, dates, venues, programme) is a provisional proposal
 * until the Organising Committee confirms it.
 */
import { CLIENT_TO_CONFIRM } from "@/lib/content";
import type { Localized } from "@/lib/i18n/config";
import { demoImages as img } from "./demo/images";
import type { Fact, StoryBeat } from "./types";

export const event = {
  name: { value: "XIII Jogos Desportivos da CPLP", status: "confirmed", source: "Official logo" },
  hostCountry: { value: "Angola", status: "confirmed", source: "Official logo (com data variants)" },
  hostCity: { value: "Luanda", status: "source", note: `${CLIENT_TO_CONFIRM} host city.` },
  startDate: { value: "2027-07-17", status: "source", note: `${CLIENT_TO_CONFIRM} provisional dates for the proposal.` },
  endDate: { value: "2027-07-25", status: "source", note: `${CLIENT_TO_CONFIRM} provisional dates for the proposal.` },
  edition: { value: "XIII", status: "confirmed", source: "Official logo" },
  nations: { value: "9", status: "confirmed", source: "CPLP member states (shown in the emblem)" },
  tagline: { value: "Nove nações. Uma comunidade.", status: "source", note: `${CLIENT_TO_CONFIRM} tagline.` },
  logo: { value: "/images/brand/cplp-logo-h.png", status: "confirmed", source: "brand-assets/logomarca" },
  mascot: { value: "/images/mascot/mascote-1.png", status: "confirmed", source: "brand-assets/Mascote", note: `${CLIENT_TO_CONFIRM} mascot name.` },
  openingCeremony: { value: "2027-07-17", status: "source", note: CLIENT_TO_CONFIRM },
  culturalNight: { value: "2027-07-21", status: "source", note: CLIENT_TO_CONFIRM },
  closingCeremony: { value: "2027-07-25", status: "source", note: CLIENT_TO_CONFIRM },
  hostBroadcaster: { value: "Televisão Pública de Angola (TPA)", status: "source", note: CLIENT_TO_CONFIRM },
} satisfies Record<string, Fact>;

/** Countdown to the opening ceremony, 18:00 Luanda time (provisional). */
export const countdownTarget = "2027-07-17T18:00:00+01:00";
/** First competition day; the live centre opens here. */
export const competitionStart = "2027-07-17T00:00:00+01:00";
/** Day 1 of the Games for the "Day n of 9" counter. */
export const gamesStart = "2027-07-17T00:00:00+01:00";
export const gamesEnd = "2027-07-25T23:59:59+01:00";

/** Ceremonies, highlighted on the schedule page and in the guide. */
export const keyDates = [
  { key: "opening", iso: "2027-07-17", place: "Luanda", location: "Estádio 11 de Novembro, Luanda", time: "18:00" },
  { key: "cultural", iso: "2027-07-21", place: null, location: undefined, time: undefined },
  { key: "closing", iso: "2027-07-25", place: null, location: undefined, time: undefined },
] as const;

/** Calendar of activities, in date order (provisional). */
export const activities = [
  { key: "councilMinisters", iso: "2027-07-16" },
  { key: "opening", iso: "2027-07-17" },
  { key: "youthCamp", iso: "2027-07-18" },
  { key: "ministerialForum", iso: "2027-07-20" },
  { key: "cultural", iso: "2027-07-21" },
  { key: "exhibitionTour", iso: "2027-07-22" },
  { key: "flagLowering", iso: "2027-07-25" },
  { key: "closing", iso: "2027-07-25" },
] as const;

/** Number of Games days (17-25 July inclusive). */
export const gamesDays = 9;

const t = (en: string, pt: string): Localized => ({ en, pt });
const fact = (value: string, en: string, pt: string, valuePt?: string) => ({
  value: { en: value, pt: valuePt ?? value },
  label: { en, pt },
});

/** Scroll story beats for "The Games" section. */
export const storyBeats: StoryBeat[] = [
  {
    id: "host",
    kicker: t("Host nation", "País anfitrião"),
    headline: t("Angola", "Angola"),
    body: t(
      "Angola welcomes the Portuguese-speaking world for the thirteenth edition of the CPLP Games.",
      "Angola recebe o mundo de língua portuguesa para a décima terceira edição dos Jogos da CPLP.",
    ),
    status: "confirmed",
    tone: "energy",
    image: img.stadiumAfrican,
    place: t("Luanda", "Luanda"),
    facts: [fact("XIII", "edition", "edição"), fact("AGO", "host nation", "país anfitrião")],
  },
  {
    id: "community",
    kicker: t("One community", "Uma comunidade"),
    headline: t("4 continents", "4 continentes"),
    body: t(
      "Athletes from Africa, Europe, South America and Asia, united by one language.",
      "Atletas de África, Europa, América do Sul e Ásia, unidos por uma língua.",
    ),
    status: "confirmed",
    tone: "region",
    image: img.storyOpening,
    facts: [fact("9", "nations", "nações"), fact("1", "language", "língua")],
  },
  {
    id: "dates",
    kicker: t("The dates", "As datas"),
    headline: t("17–25 Jul", "17–25 Jul"),
    body: t(
      "Nine days of Games in July 2027 (provisional dates, to be confirmed by the Organising Committee).",
      "Nove dias de Jogos em Julho de 2027 (datas provisórias, a confirmar pelo Comité Organizador).",
    ),
    date: "2027-07-17",
    status: "source",
    tone: "highlight",
    image: img.runnerTrack,
    facts: [fact("17", "Jul · opening", "Jul · abertura"), fact("25", "Jul · closing", "Jul · encerramento")],
  },
  {
    id: "cultural",
    kicker: t("Cultural Night", "Noite Cultural"),
    headline: t("Culture & friendship", "Cultura e amizade"),
    body: t(
      "Music, dance and food from the nine member states: the CPLP Games are as much a festival as a competition.",
      "Música, dança e gastronomia dos nove Estados-membros: os Jogos da CPLP são tanto uma festa como uma competição.",
    ),
    date: "2027-07-21",
    status: "source",
    tone: "premium",
    image: img.storyCultural,
    facts: [fact("21", "July", "Julho")],
  },
  {
    id: "closing",
    kicker: t("Closing ceremony", "Cerimónia de encerramento"),
    headline: t("25 Jul", "25 Jul"),
    body: t(
      "The Games close with the flag handover to the next host nation of the CPLP Games.",
      "Os Jogos encerram com a passagem da bandeira ao próximo país anfitrião dos Jogos da CPLP.",
    ),
    date: "2027-07-25",
    status: "source",
    tone: "energy",
    image: img.storyClosing,
    facts: [fact("25", "July", "Julho"), fact("Day 9", "the final day", "o último dia", "Dia 9")],
  },
];
