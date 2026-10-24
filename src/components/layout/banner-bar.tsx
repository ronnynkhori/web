"use client";

import { useSyncExternalStore } from "react";
import type { BannerLevel } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/icon";

const style: Record<BannerLevel, { className: string; icon: IconName }> = {
  info: { className: "bg-info text-on-info", icon: "info" },
  warning: { className: "bg-warning text-on-warning", icon: "alert" },
  alert: { className: "bg-error text-on-error", icon: "alert" },
};

const KEY = "gcr-banner-dismissed";
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function BannerBar({
  level,
  message,
  href,
  linkLabel,
  closeLabel,
}: {
  level: BannerLevel;
  message: string;
  href: string | null;
  linkLabel: string;
  closeLabel: string;
}) {
  const dismissed = useSyncExternalStore(
    subscribe,
    () => sessionStorage.getItem(KEY) === message,
    () => false,
  );
  if (dismissed) return null;
  const s = style[level];

  return (
    <div
      role={level === "alert" ? "alert" : "status"}
      className={cn(
        "fixed inset-x-0 top-[calc(var(--header-h)+env(safe-area-inset-top,0px))] z-header flex items-center gap-3 px-(--page-margin) py-2 shadow-md",
        s.className,
      )}
    >
      <Icon name={s.icon} size={20} className="shrink-0" />
      <p className="m-0 flex-1 type-label normal-case tracking-normal">
        {message}
        {href && linkLabel && (
          <a href={href} className="ml-2 underline underline-offset-4">
            {linkLabel}
          </a>
        )}
      </p>
      <button
        type="button"
        aria-label={closeLabel}
        className="grid size-touch shrink-0 place-items-center rounded-xs"
        onClick={() => {
          sessionStorage.setItem(KEY, message);
          listeners.forEach((fn) => fn());
        }}
      >
        <Icon name="close" size={20} />
      </button>
    </div>
  );
}
