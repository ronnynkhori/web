import type { ReactNode } from "react";
import type { IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { AdminIcon } from "./admin-icon";
import { toneTile, type CardTone } from "./ui/card";

export function EmptyState({
  icon,
  title,
  children,
  action,
  tone = "brand",
}: {
  icon: IconName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: CardTone;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-input bg-[radial-gradient(circle_at_50%_0%,var(--secondary),var(--card)_70%)] px-6 py-12 text-center">
      <span className={cn("grid size-14 place-items-center rounded-2xl shadow-xs ring-4 ring-card", toneTile[tone])}>
        <AdminIcon name={icon} className="size-7" />
      </span>
      <p className="text-base font-semibold">{title}</p>
      {children && <div className="max-w-sm text-sm text-muted-foreground">{children}</div>}
      {action}
    </div>
  );
}
