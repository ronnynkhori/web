"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/animation/motion-preference";
import { Icon } from "@/components/ui/icon";

const FILM = {
  hd: "/videos/promo/cplp-2027-filme-1080.mp4",
  sd: "/videos/promo/cplp-2027-filme-720.mp4",
  preview: "/videos/promo/cplp-2027-filme-preview.mp4",
  poster: "/videos/promo/cplp-2027-filme-poster.jpg",
};

interface PromoFilmProps {
  labels: { play: string; duration: string; sound: string; title: string };
}

/**
 * The official promo film. Until the visitor presses play, a silent 10-second
 * loop runs only while the frame is on screen (never under reduced motion).
 * Play swaps in the full film with sound and native controls: 1080p on
 * desktop, 720p on smaller screens. The film pauses when scrolled away.
 */
export function PromoFilm({ labels }: PromoFilmProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const filmRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const film = filmRef.current;
        if (film) {
          if (!entry.isIntersecting && !film.paused) film.pause();
          return;
        }
        const preview = previewRef.current;
        if (!preview) return;
        if (entry.isIntersecting && !prefersReducedMotion()) void preview.play().catch(() => {});
        else preview.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(frame);
    return () => io.disconnect();
  }, [src]);

  useEffect(() => {
    if (src) void filmRef.current?.play().catch(() => {});
  }, [src]);

  const start = () => setSrc(window.matchMedia("(min-width: 64rem)").matches ? FILM.hd : FILM.sd);

  return (
    <div ref={frameRef} className="promo-film relative aspect-video overflow-hidden rounded-t-md bg-[var(--tk-color-brand-navy)] shadow-[0_30px_60px_-30px_rgb(10_42_102/0.65)]">
      {src ? (
        <video
          ref={filmRef}
          className="absolute inset-0 size-full bg-black object-contain"
          src={src}
          poster={FILM.poster}
          controls
          playsInline
          preload="auto"
          aria-label={labels.title}
        />
      ) : (
        <>
          <video
            ref={previewRef}
            className="absolute inset-0 size-full object-cover"
            src={FILM.preview}
            poster={FILM.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
          />
          <span aria-hidden="true" className="promo-film-scrim absolute inset-0" />
          <button
            type="button"
            onClick={start}
            className="group absolute inset-0 flex flex-col items-center justify-center gap-4 text-[#fff] focus-visible:outline-none"
          >
            <span className="promo-film-play grid size-[clamp(4.5rem,3rem+6vw,7.5rem)] place-items-center rounded-pill bg-[var(--tk-color-brand-yellow)] text-[var(--tk-color-brand-navy)] shadow-[0_12px_40px_rgb(0_0_0/0.45)] transition-transform duration-ui group-hover:scale-105 group-focus-visible:outline-4 group-focus-visible:outline-offset-4 group-focus-visible:outline-[#fff]">
              <Icon name="play" size={32} className="translate-x-[2px]" />
            </span>
            <span className="flex flex-col items-center gap-1 text-center [text-shadow:0_1px_8px_rgb(0_0_0/0.6)]">
              <span className="type-label uppercase tracking-[0.12em]">{labels.play}</span>
              <span className="type-caption opacity-85">
                {labels.duration} · {labels.sound}
              </span>
            </span>
          </button>
        </>
      )}
    </div>
  );
}
