import Image from "next/image";
import type { ImageAsset } from "@/data/types";
import { cn } from "@/lib/cn";

const sizeClass = {
  sm: "h-6 w-7 type-caption",
  lg: "h-8 w-9 type-heading-s",
};

/**
 * Flag chip (3:2 frame, hairline ring that warms to the accent on hover,
 * following the member-nation row). Falls back to the ISO code
 * when a country has no flag file, so nothing is redrawn or approximated.
 */
export function Flag({
  code,
  name,
  flag,
  size = "sm",
  decorative,
  className,
}: {
  code: string;
  name: string;
  flag?: ImageAsset;
  size?: keyof typeof sizeClass;
  /** True when the country name is already visible next to the chip. */
  decorative?: boolean;
  className?: string;
}) {
  return (
    <span
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": name })}
      title={decorative ? undefined : name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xs bg-surface-raised font-bold text-fg-2 ring-1 ring-line",
        "transition-shadow duration-ui ease-standard group-hover:ring-line-accent",
        sizeClass[size],
        className,
      )}
    >
      {flag ? <Image src={flag.src} alt="" width={flag.width} height={flag.height} className="size-full object-cover" /> : code}
    </span>
  );
}
