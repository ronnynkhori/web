"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { confetti } from "@/lib/animation/mascot-motion";
import { prefersReducedMotion } from "@/lib/animation/motion-preference";

const KEY = "cplp2027-mascot-vote";
/** Demo baseline so the result bars have something to show before real voting exists. */
const BASE = [412, 376, 301];

export interface PollLabels {
  title: string;
  intro: string;
  options: Array<{ name: string; meaning: string }>;
  thanks: string;
}

/** "Name the mascot" teaser: a demo fan vote kept in this browser only. */
export function MascotNamePoll({ labels, flag }: { labels: PollLabels; flag: ReactNode }) {
  const [vote, setVote] = useState<number | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a stored vote after hydration
    if (saved !== null) setVote(Number(saved));
  }, []);

  const choose = (i: number, e: MouseEvent<HTMLButtonElement>) => {
    setVote(i);
    window.localStorage.setItem(KEY, String(i));
    if (!prefersReducedMotion()) {
      const r = e.currentTarget.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top + r.height / 2);
    }
  };

  const counts = BASE.map((n, i) => n + (vote === i ? 1 : 0));
  const total = counts.reduce((a, b) => a + b, 0);

  return (
    <div className="mascot-poll mt-7 rounded-md border border-line bg-surface-raised/60 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="m-0 type-heading-s">{labels.title}</h3>
        {flag}
      </div>
      <p className="m-0 mt-1 type-body-s text-fg-2">{vote === null ? labels.intro : labels.thanks}</p>
      <ul className="m-0 mt-4 grid list-none gap-2 p-0">
        {labels.options.map((o, i) => {
          const pct = Math.round((counts[i] / total) * 100);
          const chosen = vote === i;
          return (
            <li key={o.name}>
              <button
                type="button"
                aria-pressed={chosen}
                disabled={vote !== null}
                onClick={(e) => choose(i, e)}
                className={cn(
                  "press relative flex w-full min-h-touch items-center justify-between gap-3 overflow-hidden rounded-sm border px-4 py-2 text-left transition-colors duration-micro",
                  chosen ? "border-line-accent" : "border-line-strong",
                  vote === null && "hover:border-line-accent",
                )}
              >
                {vote !== null && <span aria-hidden="true" className="poll-bar absolute inset-y-0 left-0 -z-[1]" style={{ width: `${pct}%` }} />}
                <span className="flex flex-col">
                  <span className="font-display text-lg leading-tight font-extrabold uppercase">
                    {o.name}
                    {chosen && " ✓"}
                  </span>
                  <span className="type-caption text-fg-muted">{o.meaning}</span>
                </span>
                {vote !== null && <span className="type-label tabular text-accent">{pct}%</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
