import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { phases, type Phase } from "@/lib/phase";

/**
 * Staff preview of the page before, during and after the Games.
 * Only rendered for ?preview or ?phase= links, never for ordinary visitors.
 */
export function PhaseSwitch({ phase, labels }: { phase: Phase; labels: Dictionary["phase"] }) {
  return (
    <nav
      aria-label={labels.label}
      data-theme="dark"
      className="phase-switch fixed left-4 z-overlay flex items-center gap-1 rounded-pill border border-line-accent/50 bg-surface/90 p-1 text-fg shadow-lg backdrop-blur"
    >
      <span className="px-2 type-caption text-fg-muted max-tablet:sr-only">{labels.label}</span>
      {phases.map((p) => (
        <a
          key={p}
          href={`?phase=${p}`}
          aria-current={p === phase ? "page" : undefined}
          className={cn(
            "inline-flex min-h-touch items-center rounded-pill px-3 type-label transition-colors duration-ui ease-standard",
            p === phase ? "bg-action-secondary text-on-action-secondary" : "text-fg-2 hover:text-fg",
          )}
        >
          {labels[p]}
        </a>
      ))}
    </nav>
  );
}
