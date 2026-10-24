"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";
import { bezier, seconds, stagger } from "@/lib/animation/tokens";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { LanguageSwitch } from "./language-switch";
import type { HeaderLabels } from "./header";
import type { NavItem } from "./nav-items";

interface MobileNavProps {
  locale: Locale;
  items: NavItem[];
  active: string | null;
  ctaHref: string;
  labels: HeaderLabels;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const noopSubscribe = () => () => {};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen sheet from the right (mobile + tablet). Links in heading-l
 * Montserrat 800, stripe strip at the edge, language + CTA pinned at the
 * bottom (safe-area aware). Focus trap, Esc closes, body scroll locked,
 * focus returns to the trigger. Motion: sheet slide 480ms + 40ms link
 * stagger; reduced motion (MotionConfig) keeps the fade only.
 */
export function MobileNav({ locale, items, active, ctaHref, labels, open, onOpenChange }: MobileNavProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const sheetId = useId();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const close = useCallback(() => {
    onOpenChange(false);
    triggerRef.current?.focus();
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const first = sheetRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !sheetRef.current) return;
      const nodes = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) return;
      const firstEl = nodes[0];
      const lastEl = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Close if the viewport grows into the desktop layout.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 64rem)");
    const onChange = () => mq.matches && onOpenChange(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [onOpenChange]);

  const sheet = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="sheet"
          ref={sheetRef}
          id={sheetId}
          role="dialog"
          aria-modal="true"
          aria-label={labels.mobileNav}
          data-theme="dark"
          className="fixed inset-0 z-modal flex flex-col bg-surface text-fg"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: { duration: seconds("ui-slow"), ease: bezier("emphasized") } }}
          exit={{ x: "100%", opacity: 0, transition: { duration: seconds("ui"), ease: bezier("exit") } }}
        >
          <div aria-hidden="true" className="torch-stripe-vertical absolute inset-y-0 right-0 w-1" />
          <div className="container-page flex h-header items-center justify-between pt-[env(safe-area-inset-top)]">
            <span className="type-label text-fg-muted">{labels.mobileNav}</span>
            <Button variant="icon" icon="close" onClick={close} aria-label={labels.closeMenu} />
          </div>

          <nav aria-label={labels.mobileNav} className="container-page flex-1 overflow-y-auto py-5">
            <ul className="m-0 flex list-none flex-col p-0">
              {items.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                      delay: seconds("micro") + (i * stagger("list-item")) / 1000,
                      duration: seconds("content"),
                      ease: bezier("enter"),
                    },
                  }}
                  className="border-b border-line"
                >
                  <a
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    aria-current={active === item.id ? "location" : undefined}
                    className={cn(
                      "flex min-h-touch-lg items-center justify-between gap-4 py-3 type-heading-l font-extrabold",
                      active === item.id && "text-accent",
                    )}
                  >
                    {item.label}
                    <Icon name="arrow-right" className="shrink-0 text-accent" />
                  </a>
                </motion.li>
              ))}
            </ul>
          </nav>

          <div className="container-page flex flex-wrap items-center gap-4 border-t border-line py-4 pb-[max(var(--tk-space-4),env(safe-area-inset-bottom))]">
            <LanguageSwitch locale={locale} label={labels.language} switchToTemplate={labels.switchTo} placement="up" />
            <Button href={ctaHref} variant="cta" className="flex-1" onClick={() => onOpenChange(false)}>
              {labels.cta}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={sheetId}
        aria-label={open ? labels.closeMenu : labels.openMenu}
        onClick={() => onOpenChange(!open)}
        className="hover-overlay press flex size-touch-lg items-center justify-center border-2 border-action-ghost-border text-fg desktop:hidden"
      >
        <Icon name="menu" />
      </button>
      {mounted && createPortal(sheet, document.body)}
    </>
  );
}
