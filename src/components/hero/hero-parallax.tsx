"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { canRunCinematicScroll, loadScrollTrigger } from "@/lib/animation/gsap";

/**
 * Image-only parallax on the hero media layer (component-specifications §14).
 * Desktop + full motion only; GSAP is loaded on demand after first paint.
 */
export function HeroParallax({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !canRunCinematicScroll()) return;
    let revert: (() => void) | undefined;
    let cancelled = false;

    loadScrollTrigger().then(({ gsap }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        gsap.to(el, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top top", end: "bottom top", scrub: 0.8 },
        });
      });
      revert = () => ctx.revert();
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
