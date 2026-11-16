import type { RegistrationStatus } from "@/lib/registration/model";
import { cn } from "@/lib/utils";
import { registrationStatuses, statusBar } from "./meta";

/** Compact status bar for a table row. */
export function MiniBar({ counts, className }: { counts: Record<RegistrationStatus, number>; className?: string }) {
  const total = registrationStatuses.reduce((sum, status) => sum + counts[status], 0);
  return (
    <span aria-hidden="true" className={cn("flex h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      {total > 0 &&
        registrationStatuses.map((status) =>
          counts[status] ? <span key={status} className={cn("h-full", statusBar[status])} style={{ width: `${(counts[status] / total) * 100}%` }} /> : null,
        )}
    </span>
  );
}
