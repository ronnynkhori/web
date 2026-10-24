import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { reveal } from "@/lib/animation/reveal";

/**
 * Curved band edge from the emblem's swoosh: the dark section's own colour
 * rises into the neighbouring light section, with yellow and red accent lines
 * along the curve that draw in on reveal. Place inside a `relative`
 * dark-themed wrapper that does not clip its overflow.
 */
export function SwooshEdge({
  side,
  flip,
  className,
}: {
  side: "top" | "bottom";
  flip?: boolean;
  className?: string;
}) {
  const r = reveal("fade");
  const scale = `scale(${flip ? -1 : 1}, ${side === "bottom" ? -1 : 1})`;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      {...r}
      style={{ ...r.style, transform: scale } as CSSProperties}
      className={cn(
        "swoosh-edge pointer-events-none absolute inset-x-0 z-raised h-[clamp(2.25rem,5vw,4.5rem)] w-full overflow-visible text-surface",
        side === "top" ? "bottom-[calc(100%-1px)]" : "top-[calc(100%-1px)]",
        className,
      )}
    >
      <path fill="currentColor" d="M0 80C480 80 820 8 1440 10V80Z" />
      <path
        className="swoosh-line swoosh-line--yellow"
        pathLength={1}
        d="M0 68C480 68 820-4 1440-2"
      />
      <path
        className="swoosh-line swoosh-line--red"
        pathLength={1}
        d="M0 76C480 76 820 3 1440 5"
      />
    </svg>
  );
}
