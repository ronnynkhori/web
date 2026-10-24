import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const bandClass = {
  base: "bg-surface text-fg",
  alt: "bg-surface-2 text-fg",
  region: "bg-band-region text-on-band-region",
  energy: "bg-band-energy text-on-band-energy",
  highlight: "bg-band-highlight text-on-band-highlight",
};

interface SectionProps {
  id: string;
  labelledBy: string;
  band?: keyof typeof bandClass;
  /**
   * Force a token set regardless of the site theme. "dark" for cinematic
   * sections; "light" for editorial sections that set the dark/light rhythm.
   */
  theme?: "dark" | "light";
  /** Gold hairlines on the top and bottom edges (institutional frame). */
  framed?: boolean;
  className?: string;
  containerClassName?: string;
  wide?: boolean;
  children: ReactNode;
}

/** Page section: landmark + labelled heading + token section rhythm + grid margins. */
export function Section({ id, labelledBy, band = "base", theme, framed, className, containerClassName, wide, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-theme={theme}
      className={cn("relative section-y", bandClass[band], framed && "border-y border-line-accent/40", className)}
    >
      <div className={cn(wide ? "container-wide" : "container-page", containerClassName)}>{children}</div>
    </section>
  );
}
