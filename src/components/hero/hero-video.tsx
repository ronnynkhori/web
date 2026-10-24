"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/animation/motion-preference";
import { Icon } from "@/components/ui/icon";

interface HeroVideoProps {
  src: string;
  poster?: string;
  labels: { pause: string; play: string };
}

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

/**
 * Video enhancement for the hero (fallback chain: video > poster > solid
 * black with stripe edge). Loads after LCP, desktop only, good connection,
 * no Save-Data, no reduced motion. Muted loop with a pause control (a11y §4:
 * motion longer than 5s must be pausable). Never plays sound.
 */
export function HeroVideo({ src, poster, labels }: HeroVideoProps) {
  const [enabled, setEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: NetworkInfo }).connection;
    const ok =
      window.matchMedia("(min-width: 64rem)").matches &&
      !prefersReducedMotion() &&
      !conn?.saveData &&
      (!conn?.effectiveType || conn.effectiveType === "4g");
    if (!ok) return;
    const start = () => setEnabled(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 1500);
    return () => clearTimeout(t);
  }, []);

  if (!enabled) return null;

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
    setPaused(v.paused);
  };

  return (
    <>
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={paused ? labels.play : labels.pause}
        className="hover-overlay press absolute right-5 bottom-5 z-raised flex size-touch-lg items-center justify-center border-2 border-action-ghost-border bg-surface text-fg"
      >
        <Icon name={paused ? "play" : "pause"} />
      </button>
    </>
  );
}
