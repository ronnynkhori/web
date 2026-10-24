import { cn } from "@/lib/cn";

/** Inline loading indicator. Never shown alone for more than 1s without text. */
export function Spinner({ label, className }: { label?: string; className?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center", className)}>
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className="animate-spin reduced:animate-none">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" />
      </svg>
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
