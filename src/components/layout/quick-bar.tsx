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

const cellClass = (on: boolean) =>
  cn(
    "press flex h-(--quickbar-h) w-full flex-col items-center justify-center gap-[0.3rem] text-[0.625rem] leading-none font-semibold tracking-tight transition-colors duration-ui ease-standard",
    on ? "text-accent" : "text-fg-muted hover:text-fg",
  );
const pillClass = (on: boolean) =>
  cn(
    "grid h-[1.625rem] w-[2.75rem] place-items-center rounded-pill transition-colors duration-ui ease-standard",
    on && "bg-action-secondary text-on-action-secondary",
  );

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
        className="quick-bar fixed inset-x-0 bottom-0 z-sticky bg-surface/95 text-fg shadow-[0_-8px_24px_rgb(0_0_0/0.25)] backdrop-blur tablet:hidden"
      >
        <span aria-hidden="true" className="torch-stripe absolute inset-x-0 top-0 h-[3px] bg-[length:10rem_100%]" />
        <ul className="m-0 grid list-none grid-cols-4 p-0">
          {items.map((item) => {
            const on = isActive(item);
            return (
              <li key={item.key} className="min-w-0">
                <a href={item.href} aria-current={on ? "location" : undefined} className={cellClass(on)}>
                  <span className={pillClass(on)} aria-hidden="true">
                    <Icon name={item.icon} size={20} />
                  </span>
                  <span className="max-w-full truncate">{labels[item.key]}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
