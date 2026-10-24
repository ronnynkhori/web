import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * A mascot pose wired into the mascot motion system (styles/mascot-motion.css,
 * lib/animation/mascot-motion.tsx). Three layers so effects never fight:
 * - actor: scroll entrance (CSS `translate`/`scale`), pointer parallax (`translate`), GSAP scroll scenes (`transform`)
 * - body: idle bounce, hover dance and tap cheer (`transform` keyframes), pointer lean (`rotate`)
 * - image: the artwork (pages may add their own entrance class here)
 */
export function MascotActor({
  src,
  width,
  height,
  alt = "",
  sizes,
  enter = true,
  tap = true,
  idle = true,
  delay = 0,
  depth = 1,
  preload,
  className,
  bodyClassName,
  imgClassName,
}: {
  src: string;
  width: number;
  height: number;
  alt?: string;
  sizes: string;
  /** Pop in when scrolled into view. */
  enter?: boolean;
  /** Cheer when tapped or clicked (hit-tested by position, so it works behind text). */
  tap?: boolean;
  /** Gentle breathing bounce while on screen. */
  idle?: boolean;
  /** Entrance delay in ms (stagger). */
  delay?: number;
  /** Pointer-parallax strength inside a [data-mascot-track] area. */
  depth?: number;
  preload?: boolean;
  className?: string;
  bodyClassName?: string;
  imgClassName?: string;
}) {
  return (
    <span
      className={cn("mascot-actor", className)}
      data-mascot={enter ? "enter" : "static"}
      data-mascot-tap={tap ? "" : undefined}
      suppressHydrationWarning
      style={{ "--mascot-delay": `${delay}ms`, "--mascot-depth": depth } as CSSProperties}
    >
      <span className={cn("mascot-body", idle && "mascot-idle", bodyClassName)}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          preload={preload}
          draggable={false}
          className={cn("mascot-img", imgClassName)}
        />
      </span>
    </span>
  );
}
