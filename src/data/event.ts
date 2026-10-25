/**
 * Event facts for the XIII Jogos Desportivos da CPLP.
 * Confirmed by the brand book (OFFICIAL BRAND XIII CPLP, Sept 2026): name,
 * edition, the nine sports and the tagline. Confirmed by the client (Ondaka,
 * 25 Oct 2026): 25 March to 3 April 2027, the ceremony venues, the official
 * mascot (galinha-capota) and the competition venues per sport.
 * Times and the programme inside those dates remain a provisional proposal.
 */
import { CLIENT_TO_CONFIRM } from "@/lib/content";
import type { Localized } from "@/lib/i18n/config";
import { demoImages as img } from "./demo/images";
import type { Fact, StoryBeat } from "./types";

export const event = {
  name: { value: "XIII Jogos Desportivos da CPLP", status: "confirmed", source: "Brand book p.2" },
  hostCountry: { value: "Angola", status: "confirmed", source: "Brand book p.2" },
  hostCity: { value: "Luanda", status: "confirmed", source: "Client: ceremony and competition venues in Luanda" },
  startDate: { value: "2027-03-25", status: "confirmed", source: "Client, 25 Oct 2026" },
  endDate: { value: "2027-04-03", status: "confirmed", source: "Client, 25 Oct 2026" },
  edition: { value: "XIII", status: "confirmed", source: "Brand book p.2" },
  nations: { value: "9", status: "confirmed", source: "CPLP member states (shown in the emblem)" },
  tagline: { value: "Talento, união e desporto em Angola.", status: "confirmed", source: "Brand book pp.9-12" },
  logo: { value: "/images/brand/cplp-logo-h.png", status: "confirmed", source: "brand-assets/logomarca" },
  mascot: { value: "/images/mascot/mascote-1.png", status: "confirmed", source: "Brand book p.6; client: the galinha-capota" },
  openingCeremony: { value: "2027-03-25", status: "confirmed", source: "Client: Kilamba Arena", note: `${CLIENT_TO_CONFIRM} start time.` },
  culturalNight: { value: "2027-03-30", status: "source", note: CLIENT_TO_CONFIRM },
  closingCeremony: { value: "2027-04-03", status: "confirmed", source: "Client: luncheon, CCB Futungo II Marquee" },
  hostBroadcaster: { value: "Televisão Pública de Angola (TPA)", status: "source", note: CLIENT_TO_CONFIRM },
} satisfies Record<string, Fact>;

/** Countdown to the opening ceremony on 25 March, 18:00 Luanda time (time provisional). */
export const countdownTarget = "2027-03-25T18:00:00+01:00";
/** Opening day; the live centre opens here. */
export const competitionStart = "2027-03-25T00:00:00+01:00";
/** Day 1 of the Games for the "Day n of 10" counter. */
export const gamesStart = "2027-03-25T00:00:00+01:00";
export const gamesEnd = "2027-04-03T23:59:59+01:00";

/** Ceremonies, highlighted on the schedule page and in the guide. */
export const keyDates = [
  { key: "opening", iso: "2027-03-25", place: "Kilamba Arena", location: "Kilamba Arena, Luanda", time: "18:00" },
  { key: "cultural", iso: "2027-03-30", place: null, location: undefined, time: undefined },
  { key: "closing", iso: "2027-04-03", place: "CCB Futungo II · Marquee", location: "CCB Futungo II Marquee, Luanda", time: undefined },
] as const;

/** Calendar of activities, in date order (provisional inside the confirmed dates). */
export const activities = [
  { key: "councilMinisters", iso: "2027-03-24" },
  { key: "opening", iso: "2027-03-25" },
  { key: "youthCamp", iso: "2027-03-27" },
  { key: "ministerialForum", iso: "2027-03-29" },
  { key: "cultural", iso: "2027-03-30" },
  { key: "exhibitionTour", iso: "2027-03-31" },
  { key: "flagLowering", iso: "2027-04-03" },
  { key: "closing", iso: "2027-04-03" },
] as const;

/** Number of Games days (25 March to 3 April inclusive). */
export const gamesDays = 10;

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
    place: t("Kilamba Arena, Luanda", "Kilamba Arena, Luanda"),
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
    headline: t("25 Mar – 3 Apr", "25 Mar – 3 Abr"),
    body: t(
      "Ten days of Games in Luanda, from the opening ceremony at Kilamba Arena on 25 March to the closing at CCB Futungo II on 3 April 2027.",
      "Dez dias de Jogos em Luanda, da cerimónia de abertura na Kilamba Arena a 25 de Março ao encerramento no CCB Futungo II a 3 de Abril de 2027.",
    ),
    date: "2027-03-25",
    status: "confirmed",
    tone: "highlight",
    image: img.luanda,
    facts: [fact("25", "Mar · opening", "Mar · abertura"), fact("3", "Apr · closing", "Abr · encerramento")],
  },
  {
    id: "cultural",
    kicker: t("Cultural Night", "Noite Cultural"),
    headline: t("Culture & friendship", "Cultura e amizade"),
    body: t(
      "Semba, kizomba and food from the nine member states: the CPLP Games are as much a festival as a competition.",
      "Semba, kizomba e gastronomia dos nove Estados-membros: os Jogos da CPLP são tanto uma festa como uma competição.",
    ),
    date: "2027-03-30",
    status: "source",
    tone: "premium",
    image: img.cultural,
    facts: [fact("30", "March", "Março")],
  },
  {
    id: "closing",
    kicker: t("Closing ceremony", "Cerimónia de encerramento"),
    headline: t("3 Apr", "3 Abr"),
    body: t(
      "The Games close with a luncheon at the CCB Futungo II Marquee and the flag handover to the next host nation of the CPLP Games.",
      "Os Jogos encerram com um almoço na Marquee do CCB Futungo II e a passagem da bandeira ao próximo país anfitrião dos Jogos da CPLP.",
    ),
    date: "2027-04-03",
    status: "confirmed",
    tone: "energy",
    image: img.closing,
    facts: [fact("3", "April", "Abril"), fact("Day 10", "the final day", "o último dia", "Dia 10")],
  },
];
