/**
 * Proposed venues in Luanda for the proposal. [CLIENT TO CONFIRM] every venue
 * with the Organising Committee. Venues with an image are shown as cards; the
 * rest as a compact list.
 */
import type { Localized } from "@/lib/i18n/config";
import { CONTENT_REQUIRED } from "@/lib/content";
import { demoImages as img } from "./demo/images";
import type { Venue } from "./types";

const t = (en: string, pt: string): Localized => ({ en, pt });
const same = (v: string) => t(v, v);
const LUANDA = same("Luanda");

function competition(id: string, name: Localized, sports: Localized, area: Localized = LUANDA): Venue {
  return {
    id,
    name,
    role: t("Competition venue", "Recinto de competição"),
    sports,
    area,
    status: "source",
    tone: "region",
  };
}

export const venues: Venue[] = [
  {
    id: "estadio-11-novembro",
    name: t("11 November Stadium", "Estádio 11 de Novembro"),
    role: t("Opening ceremony and athletics (proposed)", "Cerimónia de abertura e atletismo (proposta)"),
    sports: t("Athletics, para athletics", "Atletismo, atletismo adaptado"),
    area: same("Camama, Luanda"),
    status: "source",
    tone: "energy",
    image: img.stadiumNight,
  },
  {
    id: "games-village",
    name: t("Games Village", "Aldeia dos Jogos"),
    role: t("Delegation accommodation and accreditation centre", "Alojamento das delegações e centro de acreditação"),
    sports: same("—"),
    area: t(CONTENT_REQUIRED, CONTENT_REQUIRED),
    status: "required",
    tone: "premium",
    image: img.guideVolunteers,
  },
  {
    id: "pavilhao-cidadela",
    name: t("Cidadela Pavilion", "Pavilhão da Cidadela"),
    role: t("Combat sports (proposed)", "Desportos de combate (proposta)"),
    sports: t("Karate, taekwondo", "Karaté, taekwondo"),
    area: LUANDA,
    status: "source",
    tone: "highlight",
    image: img.arena,
  },
  competition("estadio-coqueiros", t("Coqueiros Stadium", "Estádio dos Coqueiros"), t("Football", "Futebol")),
  competition("marginal-luanda", t("Luanda Marginal (outdoor court)", "Marginal de Luanda (campo exterior)"), t("3x3 Basketball", "Basquetebol 3x3")),
  competition("clube-tenis-luanda", t("Luanda Tennis Club", "Clube de Ténis de Luanda"), t("Tennis", "Ténis")),
];

export function getVenue(id: string): Venue | undefined {
  return venues.find((v) => v.id === id);
}
