import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Save/cancel bar. Phones: pinned above the tab bar so Save is always under
 * the thumb. Desktop: sticks to the bottom of the form while it scrolls.
 */
export function ActionBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 bottom-[var(--tabbar-h)] z-30 flex items-center gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur",
          "md:sticky md:bottom-4 md:mt-2 md:rounded-xl md:border md:bg-card/95 md:px-5 md:shadow-lg",
          "*:max-md:flex-1",
          className,
        )}
      >
        {children}
      </div>
      <div aria-hidden="true" className="h-16 md:hidden" />
    </>
  );
}
