import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { RegistrationStatus } from "@/lib/registration/model";

const style: Record<RegistrationStatus, { className: string; icon: IconName }> = {
  draft: { className: "border border-dashed border-line-strong bg-surface text-fg-2", icon: "minus" },
  submitted: { className: "bg-info text-on-info", icon: "send" },
  review: { className: "bg-surface-overlay text-fg", icon: "clock" },
  correction: { className: "bg-warning text-on-warning", icon: "alert" },
  approved: { className: "bg-success text-on-success", icon: "check" },
  rejected: { className: "bg-error text-on-error", icon: "close" },
};

/** Registration status: colour, icon and word, so it never relies on colour alone. */
export function StatusPill({ status, label, className }: { status: RegistrationStatus; label: string; className?: string }) {
  const s = style[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 type-caption font-bold whitespace-nowrap", s.className, className)}>
      <Icon name={s.icon} size={16} />
      {label}
    </span>
  );
}
