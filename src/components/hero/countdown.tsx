"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/format";
import { useMotionPreference } from "@/lib/animation/motion-preference";
import { confetti } from "@/lib/animation/mascot-motion";

export interface CountdownLabels {
  title: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  staticAlt: string;
  inProgress: string;
  finished: string;
}

interface CountdownProps {
  target: string;
  end: string;
  labels: CountdownLabels;
  size?: "hero" | "band";
  className?: string;
}

type Parts = { d: number; h: number; m: number; s: number };

function split(ms: number): Parts {
  const t = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
}

/** One odometer cell: only a digit that changes rolls, the old one leaves as the new one arrives. */
function RollDigit({ value }: { value: string }) {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<string | null>(null);
  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
  }
  return (
    <span className="digit-cell">
      <span key={`in-${current}`} className={previous === null ? undefined : "digit-in"}>
        {current}
      </span>
      {previous !== null && (
        <span key={`out-${previous}-${current}`} className="digit-out">
          {previous}
        </span>
      )}
    </span>
  );
}

/**
 * Countdown to the opening ceremony (concept 8). One role="timer" region that
 * is NOT a live region (no per-second announcements) plus a static date
 * alternative. Seconds roll (320ms); other units update quietly. Reduced
 * motion: no roll and seconds hidden. Tabular numerals = no layout shift.
 */
export function Countdown({ target, end, labels, size = "hero", className }: CountdownProps) {
  const [now, setNow] = useState<number | null>(null);
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const step = reduced ? 30_000 : 1_000;
    let id: ReturnType<typeof setTimeout>;
    // Re-arm against the wall clock so ticks land on the second boundary and never drift or skip.
    const tick = () => {
      const t = Date.now();
      setNow(t);
      id = setTimeout(tick, step - (t % step) + 10);
    };
    tick();
    return () => clearTimeout(id);
  }, [reduced]);

  const targetMs = Date.parse(target);
  const endMs = Date.parse(end);
  const started = now !== null && now >= targetMs;
  const counting = useRef(false);

  useEffect(() => {
    if (now === null) return;
    if (!started) counting.current = true;
    else if (counting.current && !reduced) {
      counting.current = false;
      for (let i = 0; i < 4; i++) window.setTimeout(() => confetti(window.innerWidth * (0.2 + i * 0.2), window.innerHeight * 0.4), i * 180);
    }
  }, [now, started, reduced]);

  if (started) {
    return (
      <p className={cn("m-0 type-display-m", className)}>
        {now >= endMs ? labels.finished : labels.inProgress}
      </p>
    );
  }

  const parts = now === null ? null : split(targetMs - now);
  const units: Array<{ key: keyof Parts; label: string }> = [
    { key: "d", label: labels.days },
    { key: "h", label: labels.hours },
    { key: "m", label: labels.minutes },
    ...(reduced ? [] : [{ key: "s" as const, label: labels.seconds }]),
  ];

  return (
    <div className={className}>
      <p className="sr-only">{labels.staticAlt}</p>
      <div role="timer" aria-live="off" aria-label={labels.title} className="flex flex-wrap">
        {parts && (
          <span className="sr-only">
            {`${parts.d} ${labels.days}, ${parts.h} ${labels.hours}, ${parts.m} ${labels.minutes}`}
          </span>
        )}
        <dl aria-hidden="true" className="m-0 grid auto-cols-fr grid-flow-col">
          {units.map((u, i) => {
            const value = parts ? (u.key === "d" ? String(parts[u.key]).padStart(2, "0") : pad2(parts[u.key])) : "--";
            return (
              <div
                key={u.key}
                className={cn(
                  "flex flex-col gap-1 px-3 tablet:px-5",
                  i === 0 ? "pl-0 tablet:pl-0" : "border-l border-line",
                )}
              >
                <dt className="order-2 type-label text-fg-muted">{u.label}</dt>
                <dd
                  className={cn(
                    "order-1 m-0 overflow-hidden tabular",
                    size === "hero" ? "type-data-xl" : "type-display-l tabular",
                  )}
                  suppressHydrationWarning
                >
                  {parts && u.key === "s"
                    ? value.split("").map((digit, di) => <RollDigit key={value.length - di} value={digit} />)
                    : value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
