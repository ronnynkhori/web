"use client";

import { useCountUp } from "@/lib/animation/use-count-up";

/** Number that counts up once on first view; final value for reduced motion. */
export function CountUp({ value, locale }: { value: number; locale?: string }) {
  const { ref, value: current } = useCountUp(value);
  return (
    <span ref={ref} className="tabular">
      <span aria-hidden="true">{current.toLocaleString(locale)}</span>
      <span className="sr-only">{value.toLocaleString(locale)}</span>
    </span>
  );
}
