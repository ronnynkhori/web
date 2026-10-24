import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isPending } from "@/lib/content";
import { ContentFlag } from "./content-flag";
import { CountUp } from "./count-up";

interface StatProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Number to show, or a content marker while the figure is unconfirmed. */
  value: number | string;
  label: string;
  size?: "xl" | "l" | "m";
  countUp?: boolean;
  locale?: string;
  align?: "start" | "center";
  valueClassName?: string;
  /** Extra <dd> notes shown under the label. */
  children?: ReactNode;
}

const sizeClass = {
  xl: "type-data-xl",
  l: "type-display-m tabular",
  m: "type-data-m",
};

/**
 * Primitive 6/8 - big number + label. Countdown units, sport/venue stats,
 * medal counts. Tabular numerals keep widths stable (no layout shift).
 */
export function Stat({ value, label, size = "xl", countUp, locale, align = "start", valueClassName, className, children, ...rest }: StatProps) {
  const pending = typeof value === "string" && isPending(value);
  return (
    <div className={cn("flex flex-col gap-2", align === "center" && "items-center text-center", className)} {...rest}>
      <dt className="order-2 type-label">{label}</dt>
      <dd className={cn("order-1 m-0", sizeClass[size], valueClassName)}>
        {pending ? (
          <ContentFlag fallback="—">{value}</ContentFlag>
        ) : typeof value === "number" && countUp ? (
          <CountUp value={value} locale={locale} />
        ) : (
          value
        )}
      </dd>
      {children}
    </div>
  );
}

/** Wrap Stats in a description list for correct semantics. */
export function StatGroup({ className, children }: { className?: string; children: ReactNode }) {
  return <dl className={cn("m-0 grid", className)}>{children}</dl>;
}
