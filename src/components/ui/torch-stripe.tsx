import { cn } from "@/lib/cn";

/**
 * Torch-stripe pattern (tokens.pattern). Dividers, loaders and section edges
 * only - never behind body text, over the logo, as a full-page background or
 * animated on loop. [ASSET REQUIRED] colour order from the official logo.
 */
export function TorchStripe({ variant = "bar", className }: { variant?: "bar" | "edge"; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(variant === "bar" ? "torch-stripe h-2 w-full" : "torch-edge pointer-events-none absolute inset-y-0 w-7", className)}
    />
  );
}
