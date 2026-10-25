/**
 * Knowledge base for the "Ask the mascot" assistant. Answers restate only what
 * the site already says. Keywords are matched accent- and case-insensitively.
 * [CONTENT REQUIRED] Organising Committee review of every answer before launch.
 */
import type { Localized } from "@/lib/i18n/config";

const t = (en: string, pt: string): Localized => ({ en, pt });

export interface FaqEntry {
  id: string;
  /** Lower-case, accent-free phrases in EN and PT. */
  keywords: string[];
  question: Localized;
  answer: Localized;
  link?: { href: string; label: Localized; external?: boolean };
}

const go = {
  guide: { href: "#guide", label: t("Open the Games guide", "Abrir o guia dos Jogos") },
  venues: { href: "#venues", label: t("See the venues", "Ver os recintos") },
  live: { href: "#live", label: t("Open the live centre", "Abrir o centro em direto") },
  sports: { href: "#sports", label: t("See the sports", "Ver as modalidades") },
  countries: { href: "#countries", label: t("Meet the nations", "Conhecer as nações") },
  mascot: { href: "#mascot", label: t("Meet the mascot", "Conhecer a mascote") },
  media: { href: "#media", label: t("Open the gallery", "Abrir a galeria") },
};

export const faq: FaqEntry[] = [
  {
    id: "dates",
    keywords: ["when", "date", "dates", "march", "april", "start", "begin", "quando", "data", "datas", "marco", "abril", "comeca", "inicio"],
    question: t("When are the Games?", "Quando são os Jogos?"),
    answer: t(
      "The XIII CPLP Games run from 25 March to 3 April 2027: the opening ceremony is on 25 March at Kilamba Arena and the closing ceremony is a luncheon on 3 April at the CCB Futungo II Marquee.",
      "Os XIII Jogos da CPLP decorrem de 25 de Março a 3 de Abril de 2027: a cerimónia de abertura é a 25 de Março na Kilamba Arena e o encerramento é um almoço a 3 de Abril na Marquee do CCB Futungo II.",
    ),
    link: go.guide,
  },
  {
    id: "where",
    keywords: ["where", "host", "city", "luanda", "angola", "onde", "anfitriao", "cidade"],
    question: t("Where are the Games held?", "Onde se realizam os Jogos?"),
    answer: t(
      "Angola is the host nation of the XIII CPLP Games. The Games are held in Luanda, with the opening ceremony at Kilamba Arena.",
      "Angola é o país anfitrião dos XIII Jogos da CPLP. Os Jogos realizam-se em Luanda, com a cerimónia de abertura na Kilamba Arena.",
    ),
    link: go.venues,
  },
  {
    id: "countries",
    keywords: ["countries", "nations", "who", "members", "paises", "nacoes", "quem", "membros", "cplp"],
    question: t("Which countries take part?", "Que países participam?"),
    answer: t(
      "The nine CPLP member states: Angola, Brazil, Cabo Verde, Guinea-Bissau, Equatorial Guinea, Mozambique, Portugal, São Tomé and Príncipe and Timor-Leste.",
      "Os nove Estados-membros da CPLP: Angola, Brasil, Cabo Verde, Guiné-Bissau, Guiné Equatorial, Moçambique, Portugal, São Tomé e Príncipe e Timor-Leste.",
    ),
    link: go.countries,
  },
  {
    id: "sports",
    keywords: ["sports", "sport", "programme", "modalidades", "modalidade", "programa", "football", "futebol", "athletics", "atletismo"],
    question: t("Which sports are on the programme?", "Que modalidades fazem parte do programa?"),
    answer: t(
      "Nine sports: athletics, para athletics, 3x3 basketball, football, karate, taekwondo, tennis, beach volleyball and chess.",
      "Nove modalidades: atletismo, atletismo adaptado, basquetebol 3x3, futebol, karaté, taekwondo, ténis, voleibol de praia e xadrez.",
    ),
    link: go.sports,
  },
  {
    id: "mascot",
    keywords: ["mascot", "mascote", "guinea fowl", "guineafowl", "galinha", "capota", "galinha capota"],
    question: t("Who is the mascot?", "Quem é a mascote?"),
    answer: t(
      "The official mascot is the capota guineafowl (galinha-capota), a recognisable element of Angolan identity. It welcomes, informs and inspires young people, and appears in the kit of every sport on the programme.",
      "A mascote oficial é a galinha-capota, um elemento reconhecível da identidade angolana. Acolhe, explica e mobiliza os mais jovens, e aparece equipada para todas as modalidades do programa.",
    ),
    link: go.mascot,
  },
  {
    id: "results",
    keywords: ["results", "scores", "medals", "live", "resultados", "marcadores", "medalhas", "direto"],
    question: t("Where can I follow results?", "Onde posso acompanhar os resultados?"),
    answer: t(
      "Live scores, event results and the medal table appear in the live centre on this site as soon as competition starts.",
      "Os marcadores, os resultados das provas e o quadro de medalhas aparecem no centro em direto deste site assim que a competição começar.",
    ),
    link: go.live,
  },
  {
    id: "photos",
    keywords: ["photos", "pictures", "gallery", "video", "fotos", "fotografias", "galeria"],
    question: t("Where are the photos?", "Onde estão as fotografias?"),
    answer: t(
      "Official photos and videos are published in the gallery every day of the Games.",
      "As fotografias e os vídeos oficiais são publicados na galeria todos os dias dos Jogos.",
    ),
    link: go.media,
  },
  {
    id: "venues",
    keywords: ["venue", "venues", "stadium", "recinto", "recintos", "estadio", "pavilhao"],
    question: t("Where are the venues?", "Onde ficam os recintos?"),
    answer: t(
      "Opening at Kilamba Arena and closing at CCB Futungo II. Competition: Sayovo (athletics), the Marginal (3x3 basketball), Cidadela (karate, taekwondo, chess), Kikuchi (tennis), AFA (football) and Ilha de Luanda (beach volleyball).",
      "Abertura na Kilamba Arena e encerramento no CCB Futungo II. Competição: Sayovo (atletismo), Marginal (basquetebol 3x3), Cidadela (karaté, taekwondo, xadrez), Kikuchi (ténis), AFA (futebol) e Ilha de Luanda (voleibol de praia).",
    ),
    link: go.venues,
  },
  {
    id: "tickets",
    keywords: ["tickets", "ticket", "entry", "free", "bilhetes", "bilhete", "entrada", "gratis", "gratuita"],
    question: t("Do I need a ticket?", "Preciso de bilhete?"),
    answer: t(
      "Entry to competition venues is planned to be free for the public, subject to capacity. This will be confirmed by the Organising Committee.",
      "A entrada nos recintos de competição está prevista ser gratuita para o público, sujeita à lotação. Será confirmado pelo Comité Organizador.",
    ),
    link: go.guide,
  },
];

export const faqSuggestions = ["dates", "mascot", "countries", "sports"] as const;
