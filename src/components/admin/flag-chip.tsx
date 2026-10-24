import Image from "next/image";
import { countries } from "@/data/countries";
import { cn } from "@/lib/utils";

const sizes = { sm: "h-5 w-7 text-[10px]", md: "h-6 w-9 text-xs", lg: "h-9 w-[3.25rem] text-sm" };

/** Country flag in a 3:2 frame; falls back to the ISO code when there is no flag file. */
export function FlagChip({ code, size = "sm", className }: { code: string; size?: keyof typeof sizes; className?: string }) {
  const flag = countries.find((c) => c.code === code)?.flag;
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted font-bold text-muted-foreground ring-1 ring-border", sizes[size], className)}
    >
      {flag ? <Image src={flag.src} alt="" width={flag.width} height={flag.height} className="size-full object-cover" /> : code}
    </span>
  );
}
