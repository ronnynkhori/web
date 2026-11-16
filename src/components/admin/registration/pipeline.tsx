import Link from "next/link";
import type { Translate } from "@/lib/admin/i18n/translate";
import type { RegistrationStatus } from "@/lib/registration/model";
import { cn } from "@/lib/utils";
import { registrationStatuses, statusBar, statusLabel } from "./meta";

/** One bar for the whole registration flow: how many records sit at each step. Each step links to its filtered list. */
export function Pipeline({ counts, t, hrefFor, className }: { counts: Record<RegistrationStatus, number>; t: Translate; hrefFor?: (status: RegistrationStatus) => string; className?: string }) {
  const total = registrationStatuses.reduce((sum, status) => sum + counts[status], 0);
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label={registrationStatuses.map((s) => `${t(statusLabel[s])}: ${counts[s]}`).join(", ")}>
        {total > 0 &&
          registrationStatuses.map((status) =>
            counts[status] ? <span key={status} className={cn("h-full border-r-2 border-card last:border-r-0", statusBar[status])} style={{ width: `${(counts[status] / total) * 100}%` }} /> : null,
          )}
      </div>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3 2xl:grid-cols-6">
        {registrationStatuses.map((status) => {
          const inner = (
            <>
              <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", statusBar[status])} />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{t(statusLabel[status])}</span>
              <span className="font-semibold tabular-nums">{counts[status]}</span>
            </>
          );
          return (
            <li key={status}>
              {hrefFor ? (
                <Link href={hrefFor(status)} className="-mx-1.5 flex items-center gap-2 rounded-md px-1.5 py-0.5 hover:bg-accent">
                  {inner}
                </Link>
              ) : (
                <span className="flex items-center gap-2">{inner}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
