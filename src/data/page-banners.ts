import type { ImageAsset } from "./types";
import { demoImages as img } from "./demo/images";

/** Background photos for inner-page title bands. Stand-ins until Games photography arrives. */
export const pageBanners = {
  sports: img.startBlocks,
  schedule: img.stadiumNight,
  results: img.resultsMedal,
  news: img.newsTorch,
} satisfies Record<string, ImageAsset>;
