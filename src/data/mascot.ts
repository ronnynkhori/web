/**
 * Official mascot artwork (brand-assets/Mascote, built by scripts/brand-assets.mjs).
 * A guinea fowl (galinha-d'angola) in the Games kit. The beach volleyball and
 * chess poses come from the brand book (OFFICIAL BRAND XIII CPLP p.7).
 * [CLIENT TO CONFIRM] mascot name.
 */
import type { Localized } from "@/lib/i18n/config";

export interface MascotPose {
  id: string;
  src: string;
  width: number;
  height: number;
  /** Sport the pose illustrates; null for the neutral welcome poses. */
  sportId: string | null;
  label: Localized;
}

const pose = (id: string, width: number, sportId: string | null, en: string, pt: string, height = 800): MascotPose => ({
  id,
  src: `/images/mascot/${id}.png`,
  width,
  height,
  sportId,
  label: { en, pt },
});

export const mascotPoses = {
  welcome: pose("mascote-1", 634, null, "Welcome", "Boas-vindas"),
  thumbsUp: pose("mascote-2", 634, null, "Thumbs up", "Força"),
  athletics: pose("atletismo-1", 607, "athletics", "Athletics", "Atletismo"),
  athletics2: pose("atletismo-2", 607, "athletics", "Athletics", "Atletismo"),
  paraAthletics: pose("atletismo-com-deficiencia-1", 727, "para-athletics", "Para athletics", "Atletismo adaptado"),
  paraAthletics2: pose("atletismo-com-deficiencia-2", 727, "para-athletics", "Para athletics", "Atletismo adaptado"),
  basketball: pose("basquetebol-3x3-2-08", 716, "basketball-3x3", "3x3 basketball", "Basquetebol 3x3"),
  basketball2: pose("basquetebol-3x3-2-07", 716, "basketball-3x3", "3x3 basketball", "Basquetebol 3x3"),
  football: pose("futebol-1", 610, "football", "Football", "Futebol"),
  football2: pose("futebol-2", 610, "football", "Football", "Futebol"),
  karate: pose("karate-1", 677, "karate", "Karate", "Karaté"),
  karate2: pose("karate-2", 677, "karate", "Karate", "Karaté"),
  taekwondo: pose("taekwondo-1", 627, "taekwondo", "Taekwondo", "Taekwondo"),
  taekwondo2: pose("taekwondo-2", 627, "taekwondo", "Taekwondo", "Taekwondo"),
  tennis: pose("tenis-1", 761, "tennis", "Tennis", "Ténis"),
  beachVolleyball: pose("voleibol-de-praia-1", 282, "beach-volleyball", "Beach volleyball", "Voleibol de praia", 356),
  chess: pose("xadrez-1", 275, "chess", "Chess", "Xadrez", 340),
} satisfies Record<string, MascotPose>;

/** One pose per sport, in programme order, for the mascot carousel. */
export const sportPoses: MascotPose[] = [
  mascotPoses.athletics,
  mascotPoses.paraAthletics,
  mascotPoses.basketball,
  mascotPoses.football,
  mascotPoses.karate,
  mascotPoses.taekwondo,
  mascotPoses.tennis,
  mascotPoses.beachVolleyball,
  mascotPoses.chess,
];
