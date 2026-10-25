/**
 * Sample announcements for the proposal. Editors replace them from the
 * Control Room once the Organising Committee publishes real notices.
 */
import type { Localized } from "@/lib/i18n/config";
import type { Announcement } from "./types";

const t = (en: string, pt: string): Localized => ({ en, pt });

/** Placeholder notices shipped before launch, by id and the reference number they carried. */
export const retiredSamples: Record<string, string> = {};

const guide = { href: "#guide", label: t("Open the Games guide", "Abrir o guia dos Jogos") };

export const announcements: Announcement[] = [
  {
    id: "ann-identity",
    kind: "important",
    pinned: true,
    title: t("Official identity and mascot of the XIII CPLP Games unveiled", "Apresentada a identidade oficial e a mascote dos XIII Jogos da CPLP"),
    body: t(
      "The emblem brings together the flags of the nine member states around three swooshes in red, blue and yellow. The official mascot is the capota guineafowl (galinha-capota): an Angolan character to welcome the youth of the CPLP.",
      "O emblema reúne as bandeiras dos nove Estados-membros em torno de três traços em vermelho, azul e amarelo. A mascote oficial é a galinha-capota: uma personagem angolana para receber a juventude da CPLP.",
    ),
    audience: t("Everyone", "Todos"),
    action: { href: "#mascot", label: t("Meet the mascot", "Conhecer a mascote") },
  },
  {
    id: "ann-entries",
    kind: "deadline",
    title: t("Delegation entries open (provisional timeline)", "Abertas as inscrições das delegações (calendário provisório)"),
    body: t(
      "National Olympic Committees and sports ministries submit their provisional delegation entries through the Organising Committee. Final dates will be confirmed in the Chef de Mission manual.",
      "Os Comités Olímpicos Nacionais e os ministérios do desporto submetem as inscrições provisórias das delegações através do Comité Organizador. As datas finais serão confirmadas no manual do Chefe de Missão.",
    ),
    audience: t("Chefs de Mission", "Chefes de Missão"),
    deadline: "2027-04-30",
    action: guide,
  },
  {
    id: "ann-volunteers",
    kind: "notice",
    title: t("Volunteer programme: register your interest", "Programa de voluntariado: manifeste o seu interesse"),
    body: t(
      "Young people in Luanda can register their interest in volunteering at the Games: accreditation, venues, transport and delegation accommodation.",
      "Os jovens de Luanda podem manifestar interesse em ser voluntários nos Jogos: acreditação, recintos, transportes e alojamento das delegações.",
    ),
    audience: t("Volunteers", "Voluntários"),
    action: guide,
  },
  {
    id: "ann-visas",
    kind: "update",
    title: t("Travel and visas for delegations", "Viagens e vistos para as delegações"),
    body: t(
      "The Organising Committee will support visa applications for accredited delegation members. Submit complete applications at least four weeks before travel.",
      "O Comité Organizador apoiará os pedidos de visto dos membros acreditados das delegações. Submeta os pedidos completos pelo menos quatro semanas antes da viagem.",
    ),
    audience: t("Delegations", "Delegações"),
    action: guide,
  },
];
