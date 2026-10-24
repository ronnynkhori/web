"use client";

import type { ReactNode } from "react";
import { useScrollScene } from "@/lib/animation/use-scroll-scene";
import { SportCard, type SportView } from "./sport-card";

/**
 * Horizontal sport gallery (motion concept 5).
 * D + full motion: the gallery pins and vertical scroll maps to horizontal
 * travel for exactly the track's overflow; card media drifts inside its frame.
 * T / M / reduced: native swipe row with scroll-snap and a peeking next card.
 */
export function SportsGallery({
  header,
  sports,
  labels,
}: {
  header: ReactNode;
  sports: SportView[];
  labels: { photo: string; hint: string };
}) {
  const ref = useScrollScene<HTMLDivElement>(({ gsap, ScrollTrigger, root }) => {
    const viewport = root.querySelector<HTMLElement>("[data-viewport]");
    const track = root.querySelector<HTMLElement>("[data-track]");
    const bar = root.querySelector<HTMLElement>("[data-progress]");
    if (!viewport || !track) return;
    root.dataset.pinned = "true";

    // Mascots lean into the direction of travel with scroll speed, then stand up again.
    const leans = gsap.utils
      .toArray<HTMLElement>(".mascot-actor", track)
      .map((actor) => gsap.quickTo(actor, "rotation", { duration: 0.5, ease: "power3.out" }));
    const lean = (deg: number) => leans.forEach((set) => set(deg));
    const settle = () => lean(0);
    ScrollTrigger.addEventListener("scrollEnd", settle);

    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    const travel = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (bar) gsap.set(bar, { scaleX: self.progress });
          lean(gsap.utils.clamp(-14, 14, -self.getVelocity() / 120));
        },
      },
    });

    gsap.utils.toArray<HTMLElement>(".sport-media", track).forEach((media) => {
      gsap.fromTo(
        media,
        { xPercent: -6, scale: 1.12 },
        {
          xPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: media, containerAnimation: travel, start: "left right", end: "right left", scrub: true },
        },
      );
    });

    return () => {
      ScrollTrigger.removeEventListener("scrollEnd", settle);
      delete root.dataset.pinned;
    };
  });

  return (
    <div ref={ref} className="sports-gallery">
      <div className="container-wide">{header}</div>
      <div data-viewport className="sports-viewport">
        <ul data-track className="sports-track m-0 list-none p-0">
          {sports.map((sport, i) => (
            <li key={sport.id} className="sports-item">
              <SportCard sport={sport} index={i} labels={labels} />
            </li>
          ))}
        </ul>
      </div>
      <div className="container-wide mt-5 flex items-center gap-4">
        <span className="sports-progress relative h-1 flex-1 overflow-hidden bg-line" aria-hidden="true">
          <span data-progress className="absolute inset-0 origin-left scale-x-0 bg-line-accent" />
        </span>
        <p className="m-0 shrink-0 type-caption text-fg-muted">{labels.hint}</p>
      </div>
    </div>
  );
}
