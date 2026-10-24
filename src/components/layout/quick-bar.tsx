"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Phase } from "@/lib/phase";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/icon";

type Item = { key: keyof Omit<Dictionary["quickBar"], "label">; href: string; section: string; icon: IconName };

const ITEMS: Record<Phase, Item[]> = {
  pre: [
    { key: "countdown", href: "#countdown", section: "countdown", icon: "calendar" },
    { key: "sports", href: "#sports", section: "sports", icon: "grid" },
    { key: "venues", href: "#venues", section: "venues", icon: "pin" },
    { key: "guide", href: "#guide", section: "guide", icon: "info" },
  ],
  live: [
    { key: "live", href: "#live", section: "live", icon: "live" },
    { key: "results", href: "#results", section: "live", icon: "list" },
    { key: "photos", href: "#media", section: "media", icon: "image" },
    { key: "sports", href: "#sports", section: "sports", icon: "grid" },
  ],
  post: [
    { key: "medals", href: "#medals", section: "live", icon: "trophy" },
    { key: "results", href: "#results", section: "live", icon: "list" },
    { key: "photos", href: "#media", section: "media", icon: "image" },
    { key: "news", href: "#news", section: "news", icon: "news" },
  ],
};

/**
 * Phones only: the four things this phase's visitors come for, one thumb away.
 * The active item follows the section in view; the hub tab follows the hash.
 */
export function QuickBar({ phase, labels }: { phase: Phase; labels: Dictionary["quickBar"] }) {
  const items = ITEMS[phase];
  const [active, setActive] = useState<string | null>(null);
  const [hash, setHash] = useState("");

  useEffect(() => {
    const ids = [...new Set(items.map((i) => i.section))];
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        let best: string | null = null;
        let ratio = 0;
        for (const [id, r] of visible) if (r > ratio) [best, ratio] = [id, r];
        setActive(best);
      },
      { threshold: [0, 0.15, 0.4, 0.7] },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    const onHash = () => setHash(location.hash);
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => {
      io.disconnect();
      window.removeEventListener("hashchange", onHash);
    };
  }, [items]);

  const isActive = (item: Item) => {
    if (item.section !== active) return false;
    const sameSection = items.filter((i) => i.section === item.section);
    if (sameSection.length === 1) return true;
    return sameSection.some((i) => i.href === hash) ? item.href === hash : item === sameSection[0];
  };

  return (
    <>
      <div className="quick-bar-spacer tablet:hidden" aria-hidden="true" />
      <nav
        aria-label={labels.label}
        data-theme="dark"
        className="quick-bar fixed inset-x-0 bottom-0 z-sticky border-t border-line bg-surface/95 text-fg backdrop-blur tablet:hidden"
      >
        <ul className="m-0 grid list-none grid-cols-4 p-0">
          {items.map((item) => {
            const on = isActive(item);
            return (
              <li key={item.key}>
                <a
                  href={item.href}
                  aria-current={on ? "location" : undefined}
                  className={cn(
                    "relative flex h-(--quickbar-h) flex-col items-center justify-center gap-1 type-caption font-semibold transition-colors duration-ui ease-standard",
                    on ? "text-accent" : "text-fg-muted",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-5 top-0 h-[2px] origin-center bg-accent transition-transform duration-ui ease-standard",
                      on ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                  <Icon name={item.icon} size={20} />
                  {labels[item.key]}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
