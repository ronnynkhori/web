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
  { id: "m1", type: "photo", title: t("Fans light up the stands", "Os adeptos iluminam as bancadas"), credit, ratio: "landscape", tone: "energy", image: img.mediaFans },
  { id: "m2", type: "photo", title: t("Eyes on the line", "Olhos na linha"), credit, ratio: "portrait", tone: "region", image: img.sprintStartBw },
  { id: "m3", type: "video", title: t("Highlights: under the lights", "Destaques: sob as luzes"), credit, durationSeconds: null, ratio: "landscape", tone: "neutral", image: img.liveFeatured },
  { id: "m4", type: "photo", title: t("The moment on the podium", "O momento no pódio"), credit, ratio: "square", tone: "highlight", image: img.resultsMedal },
  { id: "m5", type: "photo", title: t("Down the home straight", "Na reta final"), credit, ratio: "landscape", tone: "premium", image: img.trackRace },
  { id: "m6", type: "video", title: t("3x3: the final minute", "3x3: o último minuto"), credit, durationSeconds: null, ratio: "portrait", tone: "energy", image: img.basketballHoop },
  { id: "m7", type: "photo", title: t("Kick-off", "Pontapé de saída"), credit, ratio: "landscape", tone: "region", image: img.footballYouth },
  { id: "m8", type: "photo", title: t("Football by the sea", "Futebol à beira-mar"), credit, ratio: "portrait", tone: "highlight", image: img.footballBeach },
  { id: "m9", type: "photo", title: t("Nine nations, one parade", "Nove nações, um desfile"), credit, ratio: "landscape", tone: "premium", image: img.storyOpening },
  { id: "m10", type: "photo", title: t("Together at the finish", "Juntos na chegada"), credit, ratio: "landscape", tone: "energy", image: img.storyClosing },
];
