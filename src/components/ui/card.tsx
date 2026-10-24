import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Surface, type Elevation } from "./surface";

interface CardProps {
  as?: ElementType;
  elevation?: Elevation;
  orientation?: "vertical" | "horizontal";
  /** Gold left border: winner / newest / featured state. */
  accent?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Primitive 5/8 - media + body + meta. Sport, competition, venue, news,
 * photo, video, country, download and information cards all compose this.
 * Whole-card click uses the stretched-link pattern on CardLink so there is a
 * single, well-named link per card (a11y §3).
 */
export function Card({ as = "article", elevation = 1, orientation = "vertical", accent, className, children }: CardProps) {
  return (
    <Surface
      as={as}
      elevation={elevation}
      className={cn(
        "group relative flex overflow-hidden",
        orientation === "vertical" ? "flex-col" : "flex-col tablet:flex-row",
        accent && "border-l-4 border-l-line-accent",
        "focus-within:shadow-focus",
        className,
      )}
    >
      {children}
    </Surface>
  );
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-1 flex-col gap-2 p-4 tablet:p-5", className)}>{children}</div>;
}

export function CardMeta({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 type-body-s text-fg-muted", className)}>{children}</div>;
}

/** The card's single link. Its ::after covers the card for a large tap target. */
export function CardLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const cls = cn("outline-none after:absolute after:inset-0 after:z-raised after:content-['']", className);
  if (href.startsWith("#") || href.startsWith("http")) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
