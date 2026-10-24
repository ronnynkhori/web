"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";
import { useMotionPreference } from "@/lib/animation/motion-preference";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { TorchStripe } from "@/components/ui/torch-stripe";
import { LanguageSwitch } from "./language-switch";
import { MobileNav } from "./mobile-nav";
import { Navigation } from "./navigation";
import type { NavItem } from "./nav-items";

export interface HeaderLabels {
  primaryNav: string;
  mobileNav: string;
  openMenu: string;
  closeMenu: string;
  language: string;
  switchTo: string;
  logo: string;
  more: string;
  cta: string;
}

interface HeaderProps {
  locale: Locale;
  items: NavItem[];
  ctaHref: string;
  labels: HeaderLabels;
}

const CONDENSE_AT = 80;

/**
 * Variants: transparent-over-hero -> solid/condensed after 80px.
 * Hides on scroll down, returns on scroll up (transform only). Reduced motion:
 * no hide/show, instant swap. Active section gets the 4px gold underline.
 */
export function Header({ locale, items, ctaHref, labels }: HeaderProps) {
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { reduced } = useMotionPreference();
  const lastY = useRef(0);
  // After an in-page link jump the header stays put, so the target lands right under it.
  const jumping = useRef(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setCondensed(y > CONDENSE_AT);
        if (!reduced && !jumping.current) setHidden(y > lastY.current && y > window.innerHeight * 0.6);
        else setHidden(false);
        lastY.current = y;
      });
    };
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href*='#']");
      if (link instanceof HTMLAnchorElement && link.pathname === location.pathname && link.hash) jumping.current = true;
    };
    const onUserScroll = () => {
      jumping.current = false;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    window.addEventListener("wheel", onUserScroll, { passive: true });
    window.addEventListener("touchstart", onUserScroll, { passive: true });
    window.addEventListener("keydown", onUserScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchstart", onUserScroll);
      window.removeEventListener("keydown", onUserScroll);
    };
  }, [reduced]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-header-hidden", hidden && !menuOpen);
  }, [hidden, menuOpen]);

  // Scroll-spy for the active nav item.
  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [items]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-header pt-[env(safe-area-inset-top)] transition-transform duration-ui ease-standard",
        hidden && !menuOpen && "-translate-y-full",
      )}
      // Forced dark: the header floats over the cinematic hero.
      data-theme={condensed ? undefined : "dark"}
      data-surface={condensed ? undefined : "black"}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 border-b border-line bg-surface transition-opacity duration-ui ease-standard",
          condensed ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="relative container-wide flex h-header items-center justify-between gap-4 desktop:h-header-lg">
        <a href={`/${locale}`} className="flex shrink-0 items-center" aria-label={labels.logo}>
          <Logo size="header" priority />
        </a>

        <Navigation items={items} active={active} label={labels.primaryNav} moreLabel={labels.more} />

        <div className="flex items-center gap-3">
          <LanguageSwitch
            locale={locale}
            label={labels.language}
            switchToTemplate={labels.switchTo}
            className="tablet:max-desktop:hidden"
          />
          {/* Outlined over the hero so its yellow button stays the single main action. */}
          <Button href={ctaHref} variant={condensed ? "primary" : "ghost"} className="max-tablet:hidden">
            {labels.cta}
          </Button>
          <MobileNav
            locale={locale}
            items={items}
            active={active}
            ctaHref={ctaHref}
            labels={labels}
            open={menuOpen}
            onOpenChange={setMenuOpen}
          />
        </div>
      </div>
      <TorchStripe
        className={cn("absolute inset-x-0 bottom-0 h-1 transition-opacity duration-ui", condensed ? "opacity-100" : "opacity-0")}
      />
    </header>
  );
}
