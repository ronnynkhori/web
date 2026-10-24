import { cn } from "@/lib/cn";

/** Loading block in surface.raised with a slow sheen; matches final layout size. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-xs", className)} />;
}
