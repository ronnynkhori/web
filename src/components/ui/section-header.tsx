import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { reveal } from "@/lib/animation/reveal";
import { Button } from "./button";

interface SectionHeaderProps {
  id: string;
  overline: string;
  title: string;
  /** Second title line in the accent colour (two-tone headline). */
  titleAccent?: string;
  intro?: ReactNode;
  link?: { href: string; label: string };
  /** Badges next to the overline, e.g. DEMO. */
  meta?: ReactNode;
  as?: "h2" | "h3";
  /** On coloured bands overline/link inherit the band text colour for contrast. */
  onBand?: boolean;
  align?: "start" | "center";
  className?: string;
}

/**
 * Overline (tracked caps) + two-tone display title + optional "View all".
 * D: title left, link right · M: link below. Entrance (concept 17): overline
 * fades, title lines mask up in sequence, stripe draws left to right.
 */
export function SectionHeader({
  id,
  overline,
  title,
  titleAccent,
  intro,
  link,
  meta,
  as: Tag = "h2",
  onBand,
  align = "start",
  className,
}: SectionHeaderProps) {
  const center = align === "center";
  return (
    <header
      className={cn(
        "mb-7 flex flex-col gap-5 desktop:mb-8",
        center ? "items-center text-center" : "desktop:flex-row desktop:items-end desktop:justify-between",
        className,
      )}
    >
      <div className={cn("flex max-w-prose flex-col gap-3", center && "items-center")}>
        <p className={cn("m-0 flex flex-wrap items-center gap-3 type-overline", onBand && "text-current!")} {...reveal("fade", 0)}>
          <span>{overline}</span>
          {meta}
        </p>
        <Tag id={id} className="m-0 type-display-m">
          <span className="block" {...reveal("mask", 1, "text-line")}>
            {title}
          </span>
          {titleAccent && (
            <span className={cn("block", !onBand && "text-accent")} {...reveal("mask", 2, "text-line")}>
              {titleAccent}
            </span>
          )}
        </Tag>
        <span aria-hidden="true" className="torch-stripe block h-2 w-9" {...reveal("stripe", 3, "text-line")} />
        {intro && (
          <div className={cn("type-body-l", onBand ? "text-current" : "text-fg-2")} {...reveal("fade-up", 4, "text-line")}>
            {intro}
          </div>
        )}
      </div>
      {link && (
        <Button href={link.href} variant="link" icon="arrow-right" className={cn("self-start desktop:self-end", onBand && "text-current!")}>
          {link.label}
        </Button>
      )}
    </header>
  );
}
