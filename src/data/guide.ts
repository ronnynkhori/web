/**
 * Games guide for the proposal. Provisional practical information for
 * delegations, families and fans; [CLIENT TO CONFIRM] with the Organising
 * Committee before launch.
 */
import { CONTENT_REQUIRED, type ContentStatus } from "@/lib/content";
import type { DownloadItem, GuideItem } from "./types";

type Line = [en: string, pt: string];

function topic(id: string, [en, pt]: Line, lines: Line[], status: ContentStatus = "source"): GuideItem {
  return {
    id,
    title: { en, pt },
    body: { en: lines.map((l) => l[0]), pt: lines.map((l) => l[1]) },
    status,
  };
}

export const guide: GuideItem[] = [
  topic("key-dates", ["Key dates", "Datas-chave"], [
    [
      "The XIII CPLP Games take place in Angola in March 2027 (proposed: 20 to 28 March, exact days to be confirmed).",
      "Os XIII Jogos da CPLP realizam-se em Angola em Março de 2027 (proposta: 20 a 28 de Março, dias exatos a confirmar).",
    ],
    [
      "Opening ceremony: Saturday 20 March 2027, 11 November Stadium, Luanda, from 18:00 (proposed).",
      "Cerimónia de abertura: sábado, 20 de Março de 2027, Estádio 11 de Novembro, Luanda, a partir das 18:00 (proposta).",
    ],
    [
      "Cultural Night: 24 March 2027. Closing ceremony and flag handover: 28 March 2027 (proposed).",
      "Noite Cultural: 24 de Março de 2027. Cerimónia de encerramento e passagem da bandeira: 28 de Março de 2027 (proposta).",
    ],
  ]),
  topic("who-competes", ["Who competes", "Quem participa"], [
    [
      "Young athletes from the nine CPLP member states: Angola, Brazil, Cabo Verde, Guinea-Bissau, Equatorial Guinea, Mozambique, Portugal, São Tomé and Príncipe and Timor-Leste.",
      "Jovens atletas dos nove Estados-membros da CPLP: Angola, Brasil, Cabo Verde, Guiné-Bissau, Guiné Equatorial, Moçambique, Portugal, São Tomé e Príncipe e Timor-Leste.",
    ],
    [
      "Nine sports on the programme: athletics, para athletics, 3x3 basketball, football, karate, taekwondo, tennis, beach volleyball and chess.",
      "Nove modalidades no programa: atletismo, atletismo adaptado, basquetebol 3x3, futebol, karaté, taekwondo, ténis, voleibol de praia e xadrez.",
    ],
    [
      "Age limits and quotas per sport are set out on each sport page and will be confirmed in the Chef de Mission manual.",
      "Os limites de idade e as quotas por modalidade constam de cada página de modalidade e serão confirmados no manual do Chefe de Missão.",
    ],
  ]),
  topic("travel", ["Getting to Angola", "Viajar para Angola"], [
    [
      "Delegations arrive at Luanda's international airport, where the Organising Committee runs a welcome desk and transfers to the Games Village.",
      "As delegações chegam ao aeroporto internacional de Luanda, onde o Comité Organizador tem um balcão de boas-vindas e transferes para a Aldeia dos Jogos.",
    ],
    [
      "The Organising Committee supports visa applications for accredited delegation members. Apply at least four weeks before travel.",
      "O Comité Organizador apoia os pedidos de visto dos membros acreditados das delegações. Faça o pedido pelo menos quatro semanas antes da viagem.",
    ],
  ]),
  topic("village", ["Games Village and accreditation", "Aldeia dos Jogos e acreditação"], [
    [
      "Athletes and team officials stay in the Games Village. Location: [CONTENT REQUIRED].",
      "Os atletas e oficiais das equipas ficam alojados na Aldeia dos Jogos. Localização: [CONTENT REQUIRED].",
    ],
    [
      "Accreditation cards are collected on arrival and must be worn at all venues.",
      "Os cartões de acreditação são levantados à chegada e devem ser usados em todos os recintos.",
    ],
  ], "required"),
  topic("fans", ["For fans and families", "Para adeptos e famílias"], [
    [
      "Entry to competition venues is planned to be free for the public, subject to capacity (to be confirmed).",
      "A entrada nos recintos de competição está prevista ser gratuita para o público, sujeita à lotação (a confirmar).",
    ],
    [
      "All times on this site are Angola time (WAT, UTC+1). Follow the announcements for schedule changes.",
      "Todas as horas neste site são hora de Angola (WAT, UTC+1). Acompanhe os comunicados para alterações ao calendário.",
    ],
  ]),
  topic("safeguarding", ["Safeguarding and wellbeing", "Proteção e bem-estar"], [
    [
      "The XIII CPLP Games are a youth event: every delegation names a safeguarding officer and every photo of a minor needs consent.",
      "Os XIII Jogos da CPLP são um evento juvenil: cada delegação indica um responsável pela proteção e cada fotografia de um menor exige consentimento.",
    ],
    [
      "Medical services are available at every venue and in the Games Village.",
      "Há serviços médicos em todos os recintos e na Aldeia dos Jogos.",
    ],
  ]),
];

export const downloads: DownloadItem[] = [
  {
    id: "brand",
    title: { en: "Official brand manual", pt: "Manual de marca oficial" },
    fileType: "PDF",
    size: CONTENT_REQUIRED,
    language: "PT",
    href: null,
  },
  {
    id: "cdm",
    title: { en: "Chef de Mission manual", pt: "Manual do Chefe de Missão" },
    fileType: "PDF",
    size: CONTENT_REQUIRED,
    language: "PT",
    href: null,
  },
  {
    id: "schedule",
    title: { en: "Competition schedule", pt: "Calendário de competição" },
    fileType: "PDF",
    size: CONTENT_REQUIRED,
    language: "PT",
    href: null,
  },
];
