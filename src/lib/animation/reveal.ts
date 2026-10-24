import type { CSSProperties } from "react";
import { staggerDelay } from "./tokens";

export type RevealKind = "fade-up" | "fade" | "mask" | "image" | "stripe";

/**
 * Props for a once-only scroll reveal (motion concepts 13, 17).
 * Server-safe: renders data attributes; <RevealObserver/> flips them on view.
 */
export function reveal(
  kind: RevealKind = "fade-up",
  index = 0,
  staggerKey: "text-line" | "list-item" | "grid-item" = "grid-item",
): { "data-reveal": RevealKind; style: CSSProperties; suppressHydrationWarning: true } {
  return {
    "data-reveal": kind,
    style: { "--reveal-delay": `${staggerDelay(index, staggerKey)}ms` } as CSSProperties,
    // Streamed sections can be revealed (data-revealed set) before React hydrates them.
    suppressHydrationWarning: true,
  };
}
