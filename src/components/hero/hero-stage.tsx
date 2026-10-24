import type { CSSProperties } from "react";
import Image from "next/image";
import { mascotPoses, type MascotPose } from "@/data/mascot";

/**
 * Hero art from the brand book's campaign layout: the emblem's red, yellow and
 * blue swooshes sweeping across navy, with the mascot trio (football, athletics,
 * para athletics) running in from the right.
 */
export function HeroSwooshes({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className={className}>
      <defs>
        <radialGradient id="hero-glow" cx="72%" cy="42%" r="60%">
          <stop offset="0" stopColor="var(--tk-color-brand-blue)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--tk-color-brand-blue)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#hero-glow)" />
      <path
        className="hero-swoosh"
        style={{ "--swoosh-i": 0 } as CSSProperties}
        fill="var(--tk-color-brand-yellow)"
        d="M-100 700 C 420 640 980 520 1700 120 L 1700 250 C 1040 620 480 740 -100 800 Z"
      />
      <path
        className="hero-swoosh"
        style={{ "--swoosh-i": 1 } as CSSProperties}
        fill="var(--tk-color-brand-blue)"
        d="M-100 860 C 520 800 1100 700 1700 400 L 1700 520 C 1120 820 560 900 -100 960 Z"
      />
      <path
        className="hero-swoosh"
        style={{ "--swoosh-i": 2 } as CSSProperties}
        fill="var(--tk-color-brand-red)"
        d="M1420 -60 C 1590 220 1620 560 1520 960 L 1680 960 C 1760 560 1720 220 1560 -60 Z"
      />
    </svg>
  );
}

function Mascot({ pose, index, className }: { pose: MascotPose; index: number; className: string }) {
  return (
    <Image
      src={pose.src}
      alt=""
      width={pose.width}
      height={pose.height}
      sizes="(min-width: 64rem) 22vw, 40vw"
      preload={index === 1}
      style={{ "--mascot-i": index } as CSSProperties}
      className={`hero-mascot w-auto drop-shadow-[0_24px_32px_rgb(0_0_0/0.45)] ${className}`}
    />
  );
}

export function HeroMascots() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -z-[5] hidden items-end tablet:flex tablet:right-[2%] tablet:bottom-[21%] tablet:h-[min(46%,26vw)] desktop:right-[3%] desktop:bottom-[22%] desktop:h-[min(58%,22vw)] squat:h-[min(46%,22vw)]"
    >
      <Mascot pose={mascotPoses.football} index={0} className="h-[74%] -mr-[9%]" />
      <Mascot pose={mascotPoses.athletics} index={1} className="relative z-10 h-full" />
      <Mascot pose={mascotPoses.paraAthletics} index={2} className="h-[70%] -ml-[13%]" />
    </div>
  );
}

/** Phones: one mascot beside the "Angola 2027" title, clear of the actions. */
export function HeroMascotInline() {
  return (
    <Mascot
      pose={mascotPoses.athletics}
      index={1}
      className="pointer-events-none absolute right-0 bottom-0 -z-[1] h-28 tablet:hidden"
    />
  );
}
