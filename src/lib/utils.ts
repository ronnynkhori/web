import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Control Room class merging (shadcn/ui). The public site uses @/lib/cn. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
