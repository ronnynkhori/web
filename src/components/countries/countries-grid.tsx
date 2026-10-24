"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContentFlag } from "@/components/ui/content-flag";
import { isPending } from "@/lib/content";
import { Flag } from "@/components/ui/flag";
import type { ImageAsset } from "@/data/types";
import { bezier, seconds } from "@/lib/animation/tokens";
import { reveal } from "@/lib/animation/reveal";
import { cn } from "@/lib/cn";
import { fill } from "@/lib/i18n/config";
import { pad2 } from "@/lib/format";

export interface CountryView {
  code: string;
  name: string;
  flag?: ImageAsset;
  isHost: boolean;
  membershipConflict: boolean;
  delegationSize: string;
  sportsEntered: string;
}

interface Labels {
  host: string;
  selected: string;
  clear: string;
  show: string;
  delegationSize: string;
  sportsEntered: string;
  membershipFlag: string;
  demo: string;
  demoLong: string;
}

/**
 * Country grid + delegation panel (component-specifications: CountryCard
 * D 5-up / T 3-up / M 2-up). Selecting a nation moves its flag into the panel
 * as a shared element (Motion layoutId) - the country/flag transition.
 */
export function CountriesGrid({ countries, labels }: { countries: CountryView[]; labels: Labels }) {
  const [selected, setSelected] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const current = countries.find((c) => c.code === selected) ?? null;
  const transition = { duration: seconds("content"), ease: bezier("emphasized") };

  useEffect(() => {
    if (!selected || !panelRef.current) return;
    if (window.matchMedia("(max-width: 63.99rem)").matches) {
      panelRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selected]);

  return (
    <div className="flex flex-col gap-6">
      <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 tablet:grid-cols-3 tablet:gap-4 desktop:grid-cols-5 desktop:gap-5">
        {countries.map((c, i) => {
          const active = c.code === selected;
          return (
            <li key={c.code} {...reveal("fade-up", i)}>
              <button
                type="button"
                aria-pressed={active}
                aria-controls="delegation-panel"
                aria-label={fill(labels.show, { name: c.name })}
                onClick={() => setSelected(active ? null : c.code)}
                className={cn(
                  "group lift relative flex h-full w-full flex-col items-stretch overflow-hidden rounded-xs border bg-surface-2 text-left",
                  active ? "border-line-accent" : "border-line",
                )}
              >
                <span aria-hidden="true" className="rule-wipe absolute inset-x-0 top-0 h-1 bg-line-accent" />
                <span aria-hidden="true" className="index-num absolute top-2 right-3 type-caption font-bold text-fg-muted tabular">
                  {pad2(i + 1)}
                </span>
                <span className="flex h-9 items-center justify-center bg-surface tablet:h-10">
                  {active ? (
                    <span className="h-8 w-9" />
                  ) : (
                    <motion.span layoutId={`flag-${c.code}`} transition={transition} className="inline-flex">
                      <Flag code={c.code} name={c.name} flag={c.flag} size="lg" decorative />
                    </motion.span>
                  )}
                </span>
                <span className="flex flex-1 flex-col gap-1 border-t border-line px-3 py-3 tablet:px-4">
                  <span className="type-heading-s group-hover:text-accent">{c.name}</span>
                  {c.isHost && <span className="type-caption font-bold text-accent uppercase">{labels.host}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div id="delegation-panel" ref={panelRef} aria-live="polite" className="scroll-mt-[calc(var(--header-h)+var(--tk-space-4))]">
        <AnimatePresence mode="wait">
          {current && (
            <motion.section
              key={current.code}
              aria-label={labels.selected}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transition}
              className="relative grid gap-5 rounded-xs border border-line-accent bg-surface-2 p-5 tablet:grid-cols-[auto_1fr_auto] tablet:items-center tablet:gap-6 tablet:p-6"
            >
              <motion.span layoutId={`flag-${current.code}`} transition={transition} className="inline-flex self-start">
                <Flag code={current.code} name={current.name} flag={current.flag} size="lg" decorative />
              </motion.span>
              <div className="flex flex-col gap-3">
                <p className="m-0 flex flex-wrap items-center gap-2 type-overline">
                  <span>{labels.selected}</span>
                  {current.isHost && <Badge variant="winner">{labels.host}</Badge>}
                </p>
                <h3 className="m-0 type-display-m">{current.name}</h3>
                {current.membershipConflict && <ContentFlag className="self-start">{labels.membershipFlag}</ContentFlag>}
                {(!isPending(current.delegationSize) || !isPending(current.sportsEntered)) && (
                  <dl className="m-0 grid grid-cols-1 gap-3 tablet:grid-cols-2">
                    {!isPending(current.delegationSize) && (
                      <div>
                        <dt className="type-label text-fg-muted">{labels.delegationSize}</dt>
                        <dd className="m-0 mt-1">{current.delegationSize}</dd>
                      </div>
                    )}
                    {!isPending(current.sportsEntered) && (
                      <div>
                        <dt className="type-label text-fg-muted">{labels.sportsEntered}</dt>
                        <dd className="m-0 mt-1">{current.sportsEntered}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
              <Button variant="ghost" icon="close" onClick={() => setSelected(null)} className="self-start">
                {labels.clear}
              </Button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
