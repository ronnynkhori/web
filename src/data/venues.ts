/**
 * Venues of the XIII CPLP Games, from the client's venue table (Ondaka,
 * 25 Oct 2026): ceremony venues, competition venue and accommodation per
 * sport. Sayovo, Kikuchi and AFA are named as in the client's table
 * ([CLIENT TO CONFIRM] full official names). Venues with an image are shown
 * as cards; the rest as a compact list.
 */
import type { Localized } from "@/lib/i18n/config";
import { demoImages as img } from "./demo/images";
import type { Venue } from "./types";

const t = (en: string, pt: string): Localized => ({ en, pt });
const same = (v: string) => t(v, v);
const LUANDA = same("Luanda");

function competition(id: string, name: Localized, sports: Localized, area: Localized = LUANDA, status: Venue["status"] = "confirmed"): Venue {
  return {
    id,
    name,
    role: t("Competition venue", "Recinto de competição"),
    sports,
    area,
    status,
    tone: "region",
  };
}

export const venues: Venue[] = [
  {
    id: "kilamba-arena",
    name: same("Kilamba Arena"),
    role: t("Opening ceremony · 25 March 2027", "Cerimónia de abertura · 25 de Março de 2027"),
    sports: same("—"),
    area: same("Kilamba, Luanda"),
    status: "confirmed",
    tone: "energy",
    image: img.parade,
  },
  {
    id: "pavilhao-cidadela",
    name: t("Cidadela Pavilion", "Pavilhão da Cidadela"),
    role: t("Combat sports and chess", "Lutas e xadrez"),
    sports: t("Karate, taekwondo, chess", "Karaté, taekwondo, xadrez"),
    area: LUANDA,
    status: "confirmed",
    tone: "highlight",
    image: img.arena,
  },
  {
    id: "ccb-futungo",
    name: same("CCB Futungo II"),
    role: t("Closing ceremony luncheon, Marquee · 3 April 2027", "Almoço de encerramento, Marquee · 3 de Abril de 2027"),
    sports: same("—"),
    area: same("Futungo de Belas, Luanda"),
    status: "confirmed",
    tone: "premium",
    image: img.closing,
  },
  {
    id: "accommodation",
    name: t("Delegation accommodation", "Alojamento das delegações"),
    role: t(
      "Sayovo (Bengo), Ilha Mar, Hotel Vila Alice, Academia Diplomática, Zongo, Vila Alice and Futungo: each sport stays close to its venue",
      "Sayovo (Bengo), Ilha Mar, Hotel Vila Alice, Academia Diplomática, Zongo, Vila Alice e Futungo: cada modalidade fica perto do seu recinto",
    ),
    sports: same("—"),
    area: t("Luanda and Bengo", "Luanda e Bengo"),
    status: "confirmed",
    tone: "region",
    image: img.volunteers,
    noMap: true,
  },
  competition("sayovo", same("Sayovo"), t("Athletics, para athletics", "Atletismo, atletismo adaptado"), same("Bengo"), "source"),
  competition("afa", same("AFA"), t("Football", "Futebol"), LUANDA, "source"),
  competition("marginal-luanda", t("Luanda Marginal", "Marginal de Luanda"), t("3x3 Basketball", "Basquetebol 3x3")),
  competition("praia-ilha-luanda", t("Ilha de Luanda beach", "Praia da Ilha de Luanda"), t("Beach volleyball", "Voleibol de praia"), same("Ilha de Luanda")),
  competition("kikuchi", same("Kikuchi"), t("Tennis", "Ténis"), LUANDA, "source"),
];

export function getVenue(id: string): Venue | undefined {
  return venues.find((v) => v.id === id);
}
