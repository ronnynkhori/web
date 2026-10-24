import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Inner-page section title: the home page's display face and torch stripe at a
 * smaller size, so inner pages read as part of the same site.
 */
export function SubsectionTitle({
  id,
  children,
  as: Tag = "h2",
  className,
}: {
  id: string;
  children: ReactNode;
  as?: "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Tag id={id} className="m-0 type-display-m [font-size:var(--tk-type-heading-xl-size)]">
        {children}
      </Tag>
      <span aria-hidden="true" className="torch-stripe block h-1 w-8" />
    </div>
  );
}
