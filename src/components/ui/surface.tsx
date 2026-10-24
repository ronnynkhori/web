import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Elevation = 0 | 1 | 2 | 3;

/** tokens.elevation: surface tint + hairline border first, shadow second. */
const elevationClass: Record<Elevation, string> = {
  0: "bg-surface",
  1: "bg-surface-2 border border-line",
  2: "bg-surface-raised border border-line shadow-md",
  3: "bg-surface-overlay shadow-lg",
};

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  elevation?: Elevation;
  children?: ReactNode;
}

/** Primitive 1/8 - every card, panel and modal sits on a Surface. */
export function Surface({ as: Tag = "div", elevation = 1, className, children, ...rest }: SurfaceProps) {
  return (
    <Tag className={cn("rounded-xs", elevationClass[elevation], className)} {...rest}>
      {children}
    </Tag>
  );
}
