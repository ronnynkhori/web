import Image from "next/image";
import { cn } from "@/lib/cn";

const WIDTH = 1200;
const HEIGHT = 373;

/** Heights on the spacing scale (5 = 24px, 6 = 32px, 7 = 48px, 8 = 64px). */
const heightClass = {
  header: "h-[2.25rem] desktop:h-7",
  footer: "h-8",
  hero: "h-7 desktop:h-8",
};

/**
 * Official XIII CPLP Games logo (horizontal: emblem + wordmark), from the
 * supplied brand pack. Never redrawn or recoloured. On light surfaces the
 * full-colour file is used; on dark surfaces a copy with the wordmark in white
 * (emblem unchanged). The swap follows the nearest [data-theme] through the
 * --logo-* custom properties in globals.css.
 */
export function Logo({
  label,
  size = "header",
  priority,
  className,
}: {
  /** Omit when the logo sits inside a link that already carries the name. */
  label?: string;
  size?: keyof typeof heightClass;
  priority?: boolean;
  className?: string;
}) {
  const img = cn("w-auto", heightClass[size]);
  return (
    <span
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
      className={cn("inline-flex shrink-0", className)}
    >
      <Image
        src="/images/brand/cplp-logo-h-reversed.png"
        alt=""
        width={WIDTH}
        height={HEIGHT}
        preload={priority}
        sizes="200px"
        className={cn(img, "logo-on-dark")}
      />
      <Image
        src="/images/brand/cplp-logo-h.png"
        alt=""
        width={WIDTH}
        height={HEIGHT}
        sizes="200px"
        className={cn(img, "logo-on-light")}
      />
    </span>
  );
}
