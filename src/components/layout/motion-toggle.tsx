"use client";

import { cn } from "@/lib/cn";
import { useMotionPreference } from "@/lib/animation/motion-preference";

/** Footer switch for html[data-motion]; the choice is stored and overrides the OS setting. */
export function MotionToggle({ label, className }: { label: string; className?: string }) {
  const { reduced, setReduced } = useMotionPreference();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={reduced}
      onClick={() => setReduced(!reduced)}
      className={cn("inline-flex min-h-touch items-center gap-3 type-body-s text-fg-2 hover:text-fg", className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative inline-flex h-[1.5rem] w-[2.5rem] shrink-0 items-center rounded-pill border border-line-strong transition-colors duration-ui ease-standard",
          reduced ? "bg-action-secondary" : "bg-surface-2",
        )}
      >
        <span
          className={cn(
            "absolute size-[1rem] rounded-pill transition-transform duration-ui ease-standard",
            reduced ? "translate-x-[1.125rem] bg-on-action-secondary" : "translate-x-[0.1875rem] bg-fg-2",
          )}
        />
      </span>
      {label}
    </button>
  );
}
