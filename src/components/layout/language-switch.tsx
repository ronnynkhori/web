"use client";

import { useEffect, useId, useRef, useState } from "react";
import { fill, localeNames, locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

interface LanguageSwitchProps {
  locale: Locale;
  label: string;
  switchToTemplate: string;
  /** Open the menu upwards when the trigger sits near the bottom of the page. */
  placement?: "down" | "up";
  className?: string;
}

/** Globe language menu. Keeps the current section anchor when changing language. */
export function LanguageSwitch({ locale, label, switchToTemplate, placement = "down", className }: LanguageSwitchProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${label}: ${localeNames[locale]}`}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-touch min-w-touch items-center justify-center gap-1 px-2 type-label text-fg transition-colors duration-micro hover:text-accent"
      >
        <Icon name="globe" size={20} />
        <span>{locale.toUpperCase()}</span>
        <Icon
          name="chevron-down"
          size={16}
          className={cn("transition-transform duration-micro", open !== (placement === "up") && "rotate-180")}
        />
      </button>
      <nav
        id={menuId}
        aria-label={label}
        hidden={!open}
        className={cn(
          "absolute right-0 z-dropdown min-w-max border border-line bg-surface-raised p-2 shadow-md",
          placement === "up" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        <ul className="m-0 list-none p-0">
          {locales.map((l) => {
            const active = l === locale;
            return (
              <li key={l}>
                <a
                  href={`/${l}`}
                  hrefLang={l}
                  lang={l}
                  aria-current={active ? "true" : undefined}
                  aria-label={active ? localeNames[l] : fill(switchToTemplate, { language: localeNames[l] })}
                  onClick={(e) => {
                    setOpen(false);
                    if (active) {
                      e.preventDefault();
                      return;
                    }
                    const rest = window.location.pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
                    e.currentTarget.href = `/${l}${rest}${window.location.search}${window.location.hash}`;
                  }}
                  className={cn(
                    "flex min-h-touch items-center justify-between gap-5 px-3 type-body-m text-fg transition-colors duration-micro hover:bg-surface-overlay",
                    active && "font-bold text-accent",
                  )}
                >
                  {localeNames[l]}
                  {active && <Icon name="check" size={16} />}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
