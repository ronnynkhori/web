import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

export type BadgeVariant =
  | "live"
  | "upcoming"
  | "finished"
  | "postponed"
  | "cancelled"
  | "category"
  | "demo"
  | "pending"
  | "winner"
  | "success"
  | "warning"
  | "info"
  | "neutral";

const styles: Record<BadgeVariant, string> = {
  live: "bg-live text-on-live",
  upcoming: "bg-surface-overlay text-fg border border-line-strong",
  finished: "bg-surface-overlay text-fg-2",
  postponed: "bg-warning text-on-warning",
  cancelled: "bg-error text-on-error",
  category: "bg-surface text-fg",
  demo: "bg-warning text-on-warning",
  pending: "border border-dashed border-line-strong text-fg-muted bg-surface",
  winner: "bg-action-secondary text-on-action-secondary",
  success: "bg-success text-on-success",
  warning: "bg-warning text-on-warning",
  info: "bg-info text-on-info",
  neutral: "bg-surface-overlay text-fg",
};

/** Status never relies on colour alone: each carries an icon/dot + text. */
const statusIcon: Partial<Record<BadgeVariant, IconName>> = {
  postponed: "alert",
  cancelled: "close",
  finished: "check",
  upcoming: "calendar",
  winner: "check",
  demo: "info",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  /** Visually hidden prefix that gives screen readers context, e.g. "Status:". */
  srPrefix?: string;
}

/** Primitive 3/8 - LIVE, event status, winner, category, DEMO, pending content. */
export function Badge({ variant = "neutral", children, className, srPrefix }: BadgeProps) {
  const icon = statusIcon[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-sm px-2 py-1 type-label font-bold whitespace-nowrap",
        styles[variant],
        className,
      )}
    >
      {variant === "live" && <span aria-hidden="true" className="live-dot size-2 rounded-pill bg-current" />}
      {icon && <Icon name={icon} size={16} />}
      {srPrefix && <span className="sr-only">{srPrefix} </span>}
      {children}
    </span>
  );
}

/** [DEMO] marker required on every surface rendering demo data (content-rules §9). */
export function DemoBadge({ label = "Demo", title }: { label?: string; title?: string }) {
  return (
    <span title={title} className="inline-flex">
      <Badge variant="demo">{label}</Badge>
    </span>
  );
}
