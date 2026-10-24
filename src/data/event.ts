/**
 * Event facts for the XIII Jogos Desportivos da CPLP.
 * Confirmed by the brand book (OFFICIAL BRAND XIII CPLP, Sept 2026): name,
 * edition, "Angola, Março 2027", the nine sports and the tagline.
 * Everything else (city, exact days, venues, programme) is a provisional
 * proposal until the Organising Committee confirms it.
 */
import { CLIENT_TO_CONFIRM } from "@/lib/content";
import type { Localized } from "@/lib/i18n/config";
import { demoImages as img } from "./demo/images";
import type { Fact, StoryBeat } from "./types";

export const event = {
  name: { value: "XIII Jogos Desportivos da CPLP", status: "confirmed", source: "Brand book p.2" },
  hostCountry: { value: "Angola", status: "confirmed", source: "Brand book p.2" },
  hostCity: { value: "Luanda", status: "source", note: `${CLIENT_TO_CONFIRM} host city.` },
  startDate: { value: "2027-03-20", status: "source", source: "Brand book: Março 2027", note: `${CLIENT_TO_CONFIRM} exact days in March.` },
  endDate: { value: "2027-03-28", status: "source", source: "Brand book: Março 2027", note: `${CLIENT_TO_CONFIRM} exact days in March.` },
  edition: { value: "XIII", status: "confirmed", source: "Brand book p.2" },
  nations: { value: "9", status: "confirmed", source: "CPLP member states (shown in the emblem)" },
  tagline: { value: "Talento, união e desporto em Angola.", status: "confirmed", source: "Brand book pp.9-12" },
  logo: { value: "/images/brand/cplp-logo-h.png", status: "confirmed", source: "brand-assets/logomarca" },
  mascot: { value: "/images/mascot/mascote-1.png", status: "confirmed", source: "Brand book p.6", note: `${CLIENT_TO_CONFIRM} mascot name.` },
  openingCeremony: { value: "2027-03-20", status: "source", note: CLIENT_TO_CONFIRM },
  culturalNight: { value: "2027-03-24", status: "source", note: CLIENT_TO_CONFIRM },
  closingCeremony: { value: "2027-03-28", status: "source", note: CLIENT_TO_CONFIRM },
  hostBroadcaster: { value: "Televisão Pública de Angola (TPA)", status: "source", note: CLIENT_TO_CONFIRM },
} satisfies Record<string, Fact>;

/** Countdown to the opening ceremony, 18:00 Luanda time (provisional day in March 2027). */
export const countdownTarget = "2027-03-20T18:00:00+01:00";
/** First competition day; the live centre opens here. */
export const competitionStart = "2027-03-20T00:00:00+01:00";
/** Day 1 of the Games for the "Day n of 9" counter. */
export const gamesStart = "2027-03-20T00:00:00+01:00";
export const gamesEnd = "2027-03-28T23:59:59+01:00";

/** Ceremonies, highlighted on the schedule page and in the guide. */
export const keyDates = [
  { key: "opening", iso: "2027-03-20", place: "Luanda", location: "Estádio 11 de Novembro, Luanda", time: "18:00" },
  { key: "cultural", iso: "2027-03-24", place: null, location: undefined, time: undefined },
  { key: "closing", iso: "2027-03-28", place: null, location: undefined, time: undefined },
] as const;

/** Calendar of activities, in date order (provisional). */
export const activities = [
  { key: "councilMinisters", iso: "2027-03-19" },
  { key: "opening", iso: "2027-03-20" },
  { key: "youthCamp", iso: "2027-03-21" },
  { key: "ministerialForum", iso: "2027-03-23" },
  { key: "cultural", iso: "2027-03-24" },
  { key: "exhibitionTour", iso: "2027-03-25" },
  { key: "flagLowering", iso: "2027-03-28" },
  { key: "closing", iso: "2027-03-28" },
] as const;

/** Number of Games days (20-28 March inclusive). */
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
    image: img.stadium,
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
    image: img.parade,
    facts: [fact("9", "nations", "nações"), fact("9", "sports", "modalidades")],
  },
  {
    id: "dates",
    kicker: t("The dates", "As datas"),
    headline: t("March 2027", "Março 2027"),
    body: t(
      "Nine days of Games in March 2027 on the shores of Luanda bay (exact days to be confirmed by the Organising Committee).",
      "Nove dias de Jogos em Março de 2027 à beira da baía de Luanda (dias exatos a confirmar pelo Comité Organizador).",
    ),
    date: "2027-03-20",
    status: "source",
    tone: "highlight",
    image: img.luanda,
    facts: [fact("20", "Mar · opening", "Mar · abertura"), fact("28", "Mar · closing", "Mar · encerramento")],
  },
  {
    id: "cultural",
    kicker: t("Cultural Night", "Noite Cultural"),
    headline: t("Culture & friendship", "Cultura e amizade"),
    body: t(
      "Semba, kizomba and food from the nine member states: the CPLP Games are as much a festival as a competition.",
      "Semba, kizomba e gastronomia dos nove Estados-membros: os Jogos da CPLP são tanto uma festa como uma competição.",
    ),
    date: "2027-03-24",
    status: "source",
    tone: "premium",
    image: img.cultural,
    facts: [fact("24", "March", "Março")],
  },
  {
    id: "closing",
    kicker: t("Closing ceremony", "Cerimónia de encerramento"),
    headline: t("28 Mar", "28 Mar"),
    body: t(
      "The Games close with the flag handover to the next host nation of the CPLP Games.",
      "Os Jogos encerram com a passagem da bandeira ao próximo país anfitrião dos Jogos da CPLP.",
    ),
    date: "2027-03-28",
    status: "source",
    tone: "energy",
    image: img.closing,
    facts: [fact("28", "March", "Março"), fact("Day 9", "the final day", "o último dia", "Dia 9")],
  },
];
