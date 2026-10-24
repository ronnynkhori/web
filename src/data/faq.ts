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
    keywords: ["when", "date", "dates", "march", "start", "begin", "quando", "data", "datas", "marco", "comeca", "inicio"],
    question: t("When are the Games?", "Quando são os Jogos?"),
    answer: t(
      "The XIII CPLP Games take place in Angola in March 2027. The exact days will be confirmed by the Organising Committee; this proposal uses 20 to 28 March, with the opening ceremony on 20 March and the closing ceremony on 28 March.",
      "Os XIII Jogos da CPLP realizam-se em Angola em Março de 2027. Os dias exatos serão confirmados pelo Comité Organizador; esta proposta usa 20 a 28 de Março, com a cerimónia de abertura a 20 de Março e o encerramento a 28 de Março.",
    ),
    link: go.guide,
  },
  {
    id: "where",
    keywords: ["where", "host", "city", "luanda", "angola", "onde", "anfitriao", "cidade"],
    question: t("Where are the Games held?", "Onde se realizam os Jogos?"),
    answer: t(
      "Angola is the host nation of the XIII CPLP Games. The proposed host city is Luanda, with the opening ceremony at the 11 November Stadium.",
      "Angola é o país anfitrião dos XIII Jogos da CPLP. A cidade anfitriã proposta é Luanda, com a cerimónia de abertura no Estádio 11 de Novembro.",
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
    keywords: ["mascot", "mascote", "guinea fowl", "galinha", "galinha d angola"],
    question: t("Who is the mascot?", "Quem é a mascote?"),
    answer: t(
      "The mascot is a guinea fowl, the galinha-d'angola: a bird that carries Angola's name across the Portuguese-speaking world. It appears in the kit of every sport on the programme.",
      "A mascote é uma galinha-d'angola: uma ave que leva o nome de Angola a todo o mundo de língua portuguesa. Aparece equipada para todas as modalidades do programa.",
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
      "The proposed venues are in Luanda: the 11 November Stadium, the Cidadela Pavilion, the Coqueiros Stadium, the Marginal outdoor court and the Luanda Tennis Club.",
      "Os recintos propostos ficam em Luanda: o Estádio 11 de Novembro, o Pavilhão da Cidadela, o Estádio dos Coqueiros, o campo exterior da Marginal e o Clube de Ténis de Luanda.",
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
