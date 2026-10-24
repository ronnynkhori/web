import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

/** "Nothing here yet" card, so empty lists read as designed rather than broken. */
export function EmptyState({ icon = "info", text, className }: { icon?: IconName; text: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 rounded-sm border border-dashed border-line-strong p-5 tablet:p-6", className)}>
      <span className="grid size-touch shrink-0 place-items-center rounded-xs bg-surface-2 text-fg-2">
        <Icon name={icon} />
      </span>
      <p className="m-0 type-body-m text-fg-2">{text}</p>
    </div>
  );
}
