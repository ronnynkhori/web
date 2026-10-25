import type { CSSProperties } from "react";
import Image from "next/image";
import { mascotPoses } from "@/data/mascot";
import type { ImageAsset } from "@/data/types";
import { MascotActor } from "@/components/mascot/mascot-actor";
import { HeroStageScene } from "./hero-stage-scene";

/**
 * Hero art from the brand book: the emblem's swooshes framing the bottom and
 * right edge, guinea-fowl spots as texture, and a mascot stage where the nine
 * member flags arch over the mascot trio (as they ring the emblem).
 */
export function HeroSwooshes({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className={className}>
      <defs>
        <radialGradient id="hero-glow" cx="74%" cy="46%" r="55%">
          <stop offset="0" stopColor="var(--tk-color-brand-blue)" stopOpacity="0.7" />
          <stop offset="1" stopColor="var(--tk-color-brand-blue)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hero-swoosh-yellow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--tk-color-brand-yellow)" stopOpacity="0" />
          <stop offset="0.35" stopColor="var(--tk-color-brand-yellow)" stopOpacity="0.85" />
          <stop offset="1" stopColor="var(--tk-color-brand-yellow)" />
        </linearGradient>
        <linearGradient id="hero-swoosh-blue" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--tk-color-brand-blue)" stopOpacity="0.1" />
          <stop offset="1" stopColor="var(--tk-color-brand-blue)" />
        </linearGradient>
        <linearGradient id="hero-swoosh-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--tk-color-brand-red)" />
          <stop offset="1" stopColor="var(--tk-color-brand-red)" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#hero-glow)" />
      <path
        className="hero-swoosh"
        style={{ "--swoosh-i": 0 } as CSSProperties}
        fill="url(#hero-swoosh-yellow)"
        d="M-100 900 C 500 860 1050 800 1700 560 L 1700 640 C 1080 860 520 920 -100 960 Z"
      />
      <path
        className="hero-swoosh"
        style={{ "--swoosh-i": 1 } as CSSProperties}
        fill="url(#hero-swoosh-blue)"
        d="M300 960 C 800 900 1250 850 1700 700 L 1700 780 C 1260 920 820 960 300 1000 Z"
      />
      <path
        className="hero-swoosh"
        style={{ "--swoosh-i": 2 } as CSSProperties}
        fill="url(#hero-swoosh-red)"
        d="M1500 -60 C 1620 200 1650 520 1580 960 L 1700 960 C 1760 520 1740 200 1620 -60 Z"
      />
    </svg>
  );
}

/** Guinea-fowl feather spots: a faint dot field behind the stage. */
export function HeroSpots({ className }: { className?: string }) {
  return <div aria-hidden="true" className={`hero-spots ${className ?? ""}`} />;
}

/**
 * Phones: a full-bleed sports photo behind the copy, like a hero photo (the
 * flag-arch stage is too small to read there): sprinters in the brand's red,
 * blue and yellow. A navy fade from the bottom keeps the title legible.
 */
export function HeroPhotoBackdrop({ image, className }: { image: ImageAsset; className?: string }) {
  return (
    <div aria-hidden="true" className={`hero-backdrop pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className ?? ""}`}>
      <Image
        src={image.src}
        alt=""
        fill
        sizes="(min-width: 40rem) 1px, 100vw"
        loading="eager"
        fetchPriority="high"
        className="object-cover"
        style={{ objectPosition: "50% 12%" }}
      />
      <span className="hero-backdrop-scrim absolute inset-0" />
    </div>
  );
}

export interface StageFlag {
  code: string;
  name: string;
  src?: string;
}

/** Nine flags on an arch over the trio: 200deg to 340deg around the stage centre. */
function flagPosition(i: number, n: number): CSSProperties {
  const angle = ((200 + (140 * i) / Math.max(1, n - 1)) * Math.PI) / 180;
  return {
    left: `${50 + 45 * Math.cos(angle)}%`,
    top: `${52 + 45 * Math.sin(angle)}%`,
    "--flag-i": i,
  } as CSSProperties;
}

export function HeroStage({ flags, bubble, className }: { flags: StageFlag[]; bubble: string; className?: string }) {
  return (
    <HeroStageScene className={className}>
      <span aria-hidden="true" className="hero-sun absolute inset-[14%] rounded-pill" />
      <span aria-hidden="true" className="hero-ring absolute inset-[10%] rounded-pill" />
      <span aria-hidden="true" className="hero-ring hero-ring--dashed absolute inset-[6%] rounded-pill" />
      <span aria-hidden="true" className="hero-ring absolute inset-0 rounded-pill opacity-50" />

      <ul className="hero-flags m-0 list-none p-0">
        {flags.map((f, i) => (
          <li key={f.code} className="hero-flag absolute" style={flagPosition(i, flags.length)}>
            <span className="hero-flag-chip block overflow-hidden rounded-pill" title={f.name}>
              {f.src ? (
                <Image src={f.src} alt={f.name} width={48} height={48} className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center type-caption font-bold">{f.code}</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div aria-hidden="true" className="hero-trio absolute inset-x-[4%] bottom-[8%] flex h-[66%] items-end justify-center">
        <span className="hero-ground absolute inset-x-[12%] -bottom-[3%] h-[8%] rounded-pill" />
        <MascotActor
          {...mascotPoses.football}
          sizes="(min-width: 64rem) 16vw, 30vw"
          enter={false}
          depth={0.6}
          className="hero-actor h-[70%] -mr-[9%]"
          imgClassName="h-full w-auto"
        />
        <MascotActor
          {...mascotPoses.athletics}
          sizes="(min-width: 64rem) 24vw, 45vw"
          enter={false}
          depth={1}
          preload
          className="hero-actor relative z-10 h-full"
          imgClassName="h-full w-auto"
        />
        <MascotActor
          {...mascotPoses.paraAthletics}
          sizes="(min-width: 64rem) 16vw, 30vw"
          enter={false}
          depth={0.6}
          className="hero-actor h-[64%] -ml-[12%]"
          imgClassName="h-full w-auto"
        />
        <span className="hero-bubble absolute inset-x-0 top-[-13%] z-20 mx-auto w-fit rounded-md px-[0.9em] py-[0.45em] font-display text-[clamp(0.7rem,0.45rem+0.7vw,1.05rem)] font-extrabold whitespace-nowrap uppercase shadow-lg">
          {bubble}
        </span>
      </div>
    </HeroStageScene>
  );
}
