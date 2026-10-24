import type { ImageAsset } from "./types";
import { demoImages as img } from "./demo/images";

/** Background photos for inner-page title bands. Stand-ins until Games photography arrives. */
export const pageBanners = {
  sports: img.start,
  schedule: img.stadium,
  results: img.medals,
  news: img.luanda,
} satisfies Record<string, ImageAsset>;
