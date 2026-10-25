"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { announcePlay, onOtherPlay } from "./media-bus";

const SONG = {
  src: "/audio/pe-no-chao-voz-no-ar.mp3",
  cover: "/audio/pe-no-chao-voz-no-ar-capa.jpg",
  duration: 222,
};

interface SongPlayerProps {
  labels: { kicker: string; title: string; play: string; pause: string; seek: string };
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** The Games song: cover, title, play/pause and a seek bar. Loads only when played. */
export function SongPlayer({ labels }: SongPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(SONG.duration);

  useEffect(() => onOtherPlay("song", () => audioRef.current?.pause()), []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play().catch(() => {});
    else a.pause();
  };

  return (
    <div className="song-player flex items-center gap-4 rounded-md border border-line bg-surface p-3 pr-4 tablet:gap-5">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-sm tablet:size-20">
        <Image src={SONG.cover} alt="" fill sizes="80px" className={playing ? "song-cover-spin object-cover" : "object-cover"} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="m-0 type-overline text-accent">{labels.kicker}</p>
        <p className="m-0 truncate font-display text-[clamp(1.05rem,0.95rem+0.5vw,1.35rem)] leading-tight font-extrabold uppercase">{labels.title}</p>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={Math.round(duration)}
            step={1}
            value={Math.round(time)}
            onChange={(e) => {
              const a = audioRef.current;
              if (a) a.currentTime = Number(e.target.value);
              setTime(Number(e.target.value));
            }}
            aria-label={labels.seek}
            aria-valuetext={`${clock(time)} / ${clock(duration)}`}
            className="song-seek h-1 min-w-0 flex-1 cursor-pointer"
            style={{ "--song-progress": `${(time / duration) * 100}%` } as CSSProperties}
          />
          <span className="shrink-0 type-caption text-fg-muted tabular">
            {clock(time)} / {clock(duration)}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? labels.pause : labels.play}
        className="press grid size-touch-lg shrink-0 place-items-center rounded-pill bg-[var(--tk-color-brand-yellow)] text-[var(--tk-color-brand-navy)] transition-transform duration-ui hover:scale-105"
      >
        <Icon name={playing ? "pause" : "play"} size={24} className={playing ? undefined : "translate-x-[1px]"} />
      </button>
      <audio
        ref={audioRef}
        src={SONG.src}
        preload="none"
        onPlay={() => {
          setPlaying(true);
          announcePlay("song");
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setTime(0);
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
      />
    </div>
  );
}
