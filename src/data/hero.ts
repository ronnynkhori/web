/**
 * Hero media. [ASSET REQUIRED] client-supplied hero photography (poster, the
 * LCP element) and optional video (<= 6s loop, muted, <= 3MB, 1080p max).
 * DEMO: AI-generated stand-ins, art-directed per breakpoint (landscape from
 * tablet up, portrait on phones). Replace before launch.
 */
import { demoImages } from "./demo/images";
import type { ImageAsset } from "./types";

export const heroMedia: { poster: ImageAsset | null; posterMobile: ImageAsset | null; video: string | null } = {
  poster: demoImages.heroMain,
  posterMobile: demoImages.heroMobile,
  video: null,
};
