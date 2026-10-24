"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useScrollScene } from "@/lib/animation/use-scroll-scene";
import { MascotActor } from "./mascot-actor";

export interface MascotPoseView {
  id: string;
  src: string;
  width: number;
  height: number;
  label: string;
  alt: string;
}

/**
 * Large mascot artwork with a row of pose buttons that swap it.
 * Motion: the first pose pops in on scroll; each new pose springs in; tap to
 * cheer; it leans towards the pointer on desktop; and on desktop the halo and
 * the mascot drift at different speeds as the section scrolls by (GSAP).
 */
export function MascotStage({ poses, label }: { poses: MascotPoseView[]; label: string }) {
  const [active, setActive] = useState(0);
  const ref = useScrollScene<HTMLDivElement>(({ gsap, root }) => {
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.6 },
    });
    tl.fromTo(root.querySelector(".mascot-halo"), { scale: 0.75 }, { scale: 1.15 }, 0).fromTo(
      root.querySelector("[data-parallax]"),
      { yPercent: 4 },
      { yPercent: -4 },
      0,
    );
  });

  return (
    <div className="flex flex-col items-center gap-8">
      <div ref={ref} data-mascot-track="" suppressHydrationWarning className="relative grid aspect-square w-full max-w-[30rem] place-items-center">
        <span aria-hidden="true" className="mascot-halo absolute inset-[8%] rounded-pill" />
        <span aria-hidden="true" className="absolute inset-x-[22%] bottom-[3%] h-[5%] rounded-pill bg-[radial-gradient(closest-side,rgb(0_0_0/0.45),transparent)]" />
        <div data-parallax="" className="absolute inset-0">
          {poses.map((p, i) => (
            <div
              key={p.id}
              aria-hidden={i !== active}
              className={cn(
                "mascot-pose absolute inset-0 flex items-end justify-center pb-[4%] transition-opacity duration-content ease-emphasized",
                i === active ? "is-active opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <MascotActor
                src={p.src}
                width={p.width}
                height={p.height}
                alt={i === active ? p.alt : ""}
                sizes="(min-width: 64rem) 30rem, 85vw"
                preload={i === 0}
                enter={i === 0}
                tap={i === active}
                className="h-[90%] max-w-full"
                imgClassName="h-full w-auto max-w-full object-contain object-bottom drop-shadow-[0_18px_30px_rgb(0_0_0/0.35)]"
              />
            </div>
          ))}
        </div>
      </div>
      <div role="group" aria-label={label} className="flex max-w-full flex-wrap justify-center gap-2">
        {poses.map((p, i) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "group press flex min-h-touch items-center gap-2 rounded-pill border py-1 pr-4 pl-1 type-label transition-colors duration-micro",
              i === active
                ? "border-transparent bg-action-secondary text-on-action-secondary"
                : "border-line-strong text-fg hover:border-line-accent hover:text-accent",
            )}
          >
            <span className="grid size-[2.25rem] place-items-center overflow-hidden rounded-pill bg-surface-inverse">
              <Image src={p.src} alt="" width={p.width} height={p.height} sizes="36px" className="pose-thumb h-[2rem] w-auto" />
            </span>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
