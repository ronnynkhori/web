"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";

export interface MascotPoseView {
  id: string;
  src: string;
  width: number;
  height: number;
  label: string;
  alt: string;
}

/** Large mascot artwork with a row of pose buttons that swap it. */
export function MascotStage({ poses, label }: { poses: MascotPoseView[]; label: string }) {
  const [active, setActive] = useState(0);
  const current = poses[active];
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative grid aspect-square w-full max-w-[30rem] place-items-center">
        <span aria-hidden="true" className="mascot-halo absolute inset-[8%] rounded-pill" />
        {poses.map((p, i) => (
          <Image
            key={p.id}
            src={p.src}
            alt={i === active ? p.alt : ""}
            aria-hidden={i !== active}
            width={p.width}
            height={p.height}
            sizes="(min-width: 64rem) 30rem, 85vw"
            preload={i === 0}
            className={cn(
              "absolute inset-0 m-auto h-[92%] w-auto drop-shadow-[0_18px_30px_rgb(0_0_0/0.35)] transition-[opacity,transform] duration-content ease-emphasized",
              i === active ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0",
            )}
          />
        ))}
      </div>
      <div role="group" aria-label={label} className="flex max-w-full flex-wrap justify-center gap-2">
        {poses.map((p, i) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={i === active}
            onClick={() => setActive(i)}
            className={cn(
              "press flex min-h-touch items-center gap-2 rounded-pill border py-1 pr-4 pl-1 type-label transition-colors duration-micro",
              i === active
                ? "border-transparent bg-action-secondary text-on-action-secondary"
                : "border-line-strong text-fg hover:border-line-accent hover:text-accent",
            )}
          >
            <span className="grid size-9 place-items-center overflow-hidden rounded-pill bg-surface-inverse">
              <Image src={p.src} alt="" width={p.width} height={p.height} sizes="36px" className="h-8 w-auto" />
            </span>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
