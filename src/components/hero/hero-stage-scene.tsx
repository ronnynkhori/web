"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useScrollScene } from "@/lib/animation/use-scroll-scene";

/**
 * Scroll scene for the hero stage (desktop, full motion; GSAP loads on demand).
 * As the hero scrolls away the trio sprints off in different directions, the
 * flags lift and fan out and the rings expand. Phones keep the static stage
 * plus the CSS entrance and tap cheers.
 */
export function HeroStageScene({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useScrollScene<HTMLDivElement>(({ gsap, root }) => {
    const hero = root.closest("[data-hero]") ?? root;
    const actors = gsap.utils.toArray<HTMLElement>(".hero-actor", root);
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.7 },
    });
    tl.to(root.querySelector(".hero-bubble"), { autoAlpha: 0, y: -24, scale: 0.8, duration: 0.25 }, 0)
      .to(actors, { x: (i: number) => [-140, 60, 220][i] ?? 0, y: (i: number) => [40, -60, 20][i] ?? 0, rotation: (i: number) => [-8, 6, 10][i] ?? 0, duration: 1, stagger: 0.06 }, 0)
      .to(gsap.utils.toArray<HTMLElement>(".hero-flag", root), { y: -50, scale: 1.25, autoAlpha: 0, stagger: { each: 0.04, from: "center" }, duration: 0.7 }, 0.1)
      .to(gsap.utils.toArray<HTMLElement>(".hero-ring", root), { scale: 1.25, autoAlpha: 0, duration: 1 }, 0);
  });

  return (
    <div ref={ref} data-mascot-track="" suppressHydrationWarning className={cn("hero-stage relative aspect-square", className)}>
      {children}
    </div>
  );
}
