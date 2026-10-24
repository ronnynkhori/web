"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import type { NavItem } from "./nav-items";

interface NavigationProps {
  items: NavItem[];
  active: string | null;
  label: string;
  moreLabel: string;
}

const linkClass =
  "u-wipe flex min-h-touch items-center whitespace-nowrap type-label text-fg transition-colors duration-micro hover:text-accent";

/**
 * Desktop navigation: primary items inline + "More" menu at every width.
 * Active item: 4px underline (scaleX wipe).
 */
export function Navigation({ items, active, label, moreLabel }: NavigationProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const overflow = items.filter((i) => !i.primary);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMoreOpen(false);
        moreRef.current?.querySelector("button")?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [moreOpen]);

  return (
    <nav aria-label={label} className="hidden desktop:block">
      <ul className="m-0 flex list-none items-center gap-5 p-0 large:gap-6">
        {items.map((item) => (
          <li key={item.id} className={cn(!item.primary && "hidden")}>
            <a href={item.href} className={linkClass} aria-current={active === item.id ? "location" : undefined}>
              {item.label}
            </a>
          </li>
        ))}
        {overflow.length > 0 && (
          <li className="relative">
            <div ref={moreRef}>
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-controls={menuId}
                onClick={() => setMoreOpen((v) => !v)}
                className={cn(linkClass, "gap-1")}
              >
                {moreLabel}
                <Icon name="chevron-down" size={16} className={cn("transition-transform duration-micro", moreOpen && "rotate-180")} />
              </button>
              <ul
                id={menuId}
                hidden={!moreOpen}
                className="absolute top-full right-0 z-dropdown m-0 mt-2 min-w-max list-none border border-line bg-surface-raised p-2 shadow-md"
              >
                {overflow.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      aria-current={active === item.id ? "location" : undefined}
                      className="flex min-h-touch items-center px-3 type-label text-fg hover:bg-surface-overlay"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        )}
      </ul>
    </nav>
  );
}
