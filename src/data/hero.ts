/**
 * Optional hero media under the swooshes and mascot trio. The hero is
 * mascot-led, so both stay empty unless the client supplies photography
 * (poster, the LCP element) or a video (<= 6s loop, muted, <= 3MB, 1080p max).
 */
import type { ImageAsset } from "./types";

export const heroMedia: { poster: ImageAsset | null; posterMobile: ImageAsset | null; video: string | null } = {
  poster: null,
  posterMobile: null,
  video: null,
};
