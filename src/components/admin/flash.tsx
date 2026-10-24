"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useT } from "./i18n";

/**
 * Shows a toast for "?saved=…" style redirects from server actions, then
 * removes the flag from the address bar so a refresh does not repeat it.
 */
export function Flash({ message, tone = "success", param }: { message: string | null | undefined; tone?: "success" | "error" | "info"; param: string }) {
  const shown = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const t = useT();

  useEffect(() => {
    if (!message || shown.current) return;
    shown.current = true;
    toast[tone](t(message));
    const next = new URLSearchParams(params.toString());
    next.delete(param);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [message, tone, param, params, pathname, router, t]);

  return null;
}
