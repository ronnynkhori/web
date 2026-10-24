import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isPending } from "@/lib/content";

/**
 * Unresolved markers ([CONTENT REQUIRED] etc.) are hidden from visitors and
 * shown as dashed editorial flags in review mode (`?review=1`, set by the boot
 * script). `fallback` is what visitors see instead (e.g. "—").
 * `npm run check:release` blocks launch while any marker remains.
 */
export function Content({ value, className }: { value: string; className?: string }) {
  if (!isPending(value)) return <>{value}</>;
  return (
    <ContentFlag className={className} fallback="—">
      {value}
    </ContentFlag>
  );
}

export function ContentFlag({
  children,
  className,
  fallback,
}: {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
}) {
  return (
    <>
      <span
        className={cn(
          "content-flag rounded-xs border border-dashed border-line-strong px-2 py-1 font-ui type-caption normal-case tracking-normal text-fg-muted",
          className,
        )}
      >
        {children}
      </span>
      {fallback != null && <span className="content-fallback">{fallback}</span>}
    </>
  );
}

const MARKERS = /(\s*\[(?:CONTENT REQUIRED|ASSET REQUIRED|DECISION REQUIRED|CLIENT TO CONFIRM|PT REVIEW|FR REVIEW)[^\]]*\])/;

/** Splits markers out of a sentence: "Start time [CONTENT REQUIRED]." */
export function RichContent({ text }: { text: string }) {
  const parts = text.split(MARKERS);
  return (
    <>
      {parts.map((part, i) =>
        isPending(part) && part.trim().startsWith("[") ? (
          <ContentFlag key={i} fallback={parts[i - 1]?.trimEnd().endsWith(":") ? " —" : undefined}>
            {part.trim()}
          </ContentFlag>
        ) : (
          part
        ),
      )}
    </>
  );
}
