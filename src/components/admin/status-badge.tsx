import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

export type Tone = "success" | "warning" | "info" | "neutral" | "error" | "live" | "brand";

const toneClass: Record<Tone, string> = {
  success: "border-transparent bg-success text-success-foreground",
  warning: "border-transparent bg-warning text-warning-foreground",
  info: "border-transparent bg-info text-info-foreground",
  neutral: "border-border bg-muted text-muted-foreground",
  error: "border-transparent bg-destructive/10 text-destructive",
  live: "border-transparent bg-live text-live-foreground",
  brand: "border-transparent bg-highlight text-highlight-foreground",
};

/** One badge style per meaning, used by every list and editor. */
export function StatusBadge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <Badge variant="outline" className={cn("h-6 gap-1 rounded-full px-2.5 text-xs font-semibold", toneClass[tone], className)}>
      {tone === "live" && <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-current" />}
      {children}
    </Badge>
  );
}
