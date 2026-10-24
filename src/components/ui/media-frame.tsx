import Image from "next/image";
import type { ReactNode } from "react";
import type { ImageAsset, Tone } from "@/data/types";
import { cn } from "@/lib/cn";

export type Ratio = "16/9" | "16/10" | "4/5" | "3/2" | "1/1" | "21/9" | "fill";

const ratioClass: Record<Ratio, string> = {
  "16/9": "aspect-video",
  "16/10": "aspect-[16/10]",
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-square",
  "21/9": "aspect-[21/9]",
  fill: "absolute inset-0",
};

const toneClass: Record<Tone, string> = {
  energy: "bg-band-energy text-on-band-energy",
  region: "bg-band-region text-on-band-region",
  highlight: "bg-band-highlight text-on-band-highlight",
  premium: "bg-band-premium text-on-band-premium",
  neutral: "bg-surface-raised text-fg-muted",
};

interface MediaFrameProps {
  ratio?: Ratio;
  image?: ImageAsset;
  alt?: string;
  /** Shown on placeholder art until photography is supplied. */
  placeholderLabel?: string;
  tone?: Tone;
  scrim?: "none" | "card" | "hero";
  priority?: boolean;
  sizes?: string;
  className?: string;
  mediaClassName?: string;
  children?: ReactNode;
}

/**
 * Primitive 4/8 - image/video frame with fixed ratio (no CLS) and the
 * black-only scrim. Without an approved asset it renders branded placeholder
 * art (brand fill + diagonal slab rhythm) labelled [ASSET REQUIRED].
 */
export function MediaFrame({
  ratio = "16/9",
  image,
  alt = "",
  placeholderLabel,
  tone = "neutral",
  scrim = "none",
  priority,
  sizes = "(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw",
  className,
  mediaClassName,
  children,
}: MediaFrameProps) {
  return (
    <div className={cn("overflow-hidden", ratio === "fill" ? ratioClass.fill : `relative ${ratioClass[ratio]}`, className)}>
      <div className={cn("absolute inset-0", mediaClassName)}>
        {image ? (
          <Image
            src={image.src}
            alt={alt}
            fill
            sizes={sizes}
            preload={priority}
            fetchPriority={priority ? "high" : undefined}
            className="object-cover"
          />
        ) : (
          <div className={cn("placeholder-art absolute inset-0", toneClass[tone])} aria-hidden="true">
            <span className="slab-pattern absolute inset-0" />
          </div>
        )}
      </div>
      {scrim === "card" && <div className="absolute inset-0 scrim-card" aria-hidden="true" />}
      {scrim === "hero" && <div className="absolute inset-0 scrim-hero" aria-hidden="true" />}
      {!image && placeholderLabel && (
        <span className="content-flag absolute top-3 left-3 z-raised rounded-xs bg-surface px-2 py-1 type-caption text-fg-muted">
          {placeholderLabel}
        </span>
      )}
      {children}
    </div>
  );
}
