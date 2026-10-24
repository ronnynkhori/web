import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

type Severity = "info" | "warning" | "success" | "error";

const styles: Record<Severity, { cls: string; icon: IconName }> = {
  info: { cls: "bg-surface-2 border-l-4 border-l-line-accent text-fg", icon: "info" },
  warning: { cls: "bg-warning text-on-warning", icon: "alert" },
  success: { cls: "bg-success text-on-success", icon: "check" },
  error: { cls: "bg-error text-on-error", icon: "alert" },
};

/** Inline banner: icon + text, never colour alone. role by severity. */
export function Alert({ severity = "info", children, className }: { severity?: Severity; children: ReactNode; className?: string }) {
  const s = styles[severity];
  return (
    <div
      role={severity === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-3 rounded-xs px-4 py-3 type-body-s", s.cls, className)}
    >
      <Icon name={s.icon} className="mt-1 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
