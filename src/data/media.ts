/**
 * Media gallery - DEMO captions and imagery for the proposal.
 * [ASSET REQUIRED] Games photography and video with credits and consent.
 */
import type { Localized } from "@/lib/i18n/config";
import { demoImages as img } from "./demo/images";
import type { MediaItem } from "./types";

const t = (en: string, pt: string): Localized => ({ en, pt });
const credit = "Demo";

/** Full-resolution photo downloads link out to a gallery host. [CONTENT REQUIRED] real URL. */
export const photoDownloadsUrl: string | null = null;

export const media: MediaItem[] = [
  { id: "m1", type: "photo", title: t("Red, blue and yellow in the stands", "Vermelho, azul e amarelo nas bancadas"), credit, ratio: "landscape", tone: "energy", image: img.fans },
  { id: "m2", type: "photo", title: t("Set", "Aos seus lugares"), credit, ratio: "portrait", tone: "region", image: img.athletics },
  { id: "m3", type: "video", title: t("Highlights: under the lights", "Destaques: sob as luzes"), credit, durationSeconds: null, ratio: "landscape", tone: "neutral", image: img.broadcast },
  { id: "m4", type: "photo", title: t("The medals of Angola 2027", "As medalhas de Angola 2027"), credit, ratio: "square", tone: "highlight", image: img.medals },
  { id: "m5", type: "photo", title: t("Beach volleyball on the Ilha", "Voleibol de praia na Ilha"), credit, ratio: "portrait", tone: "premium", image: img.beachVolleyball },
  { id: "m6", type: "video", title: t("3x3 on the Marginal", "3x3 na Marginal"), credit, durationSeconds: null, ratio: "portrait", tone: "energy", image: img.basketball },
  { id: "m7", type: "photo", title: t("Luanda by night", "Luanda à noite"), credit, ratio: "landscape", tone: "region", image: img.luanda },
  { id: "m8", type: "photo", title: t("Check", "Xeque"), credit, ratio: "portrait", tone: "highlight", image: img.chess },
  { id: "m9", type: "photo", title: t("Nine nations, one parade", "Nove nações, um desfile"), credit, ratio: "landscape", tone: "premium", image: img.parade },
  { id: "m10", type: "photo", title: t("Together at the finish", "Juntos na chegada"), credit, ratio: "landscape", tone: "energy", image: img.closing },
];
