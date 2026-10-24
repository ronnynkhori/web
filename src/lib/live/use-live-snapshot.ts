"use client";

import { useEffect, useRef, useState } from "react";
import type { LiveSnapshot } from "./types";

const BASE_INTERVAL = 20_000;
const MAX_INTERVAL = 120_000;

/** Keys like "match:<id>:home" or "medal:<code>" whose value changed in the last update. */
export type ChangeSet = ReadonlySet<string>;

function diff(prev: LiveSnapshot, next: LiveSnapshot): Set<string> {
  const changed = new Set<string>();
  const prevMatches = new Map(prev.matches.map((m) => [m.id, m]));
  for (const m of next.matches) {
    const p = prevMatches.get(m.id);
    if (!p) continue;
    if (p.home.score !== m.home.score) changed.add(`match:${m.id}:home`);
    if (p.away.score !== m.away.score) changed.add(`match:${m.id}:away`);
    if (p.timeline[0]?.id !== m.timeline[0]?.id) changed.add(`timeline:${m.id}`);
  }
  const prevMedals = new Map(prev.medals.map((r) => [r.countryCode, r]));
  for (const r of next.medals) {
    const p = prevMedals.get(r.countryCode);
    if (p && (p.total !== r.total || p.rank !== r.rank)) changed.add(`medal:${r.countryCode}`);
  }
  return changed;
}

/**
 * Polls /api/live (performance rules: 15-30s, backoff, pause when hidden).
 * Updates are calm: callers highlight `changed` keys, never re-layout.
 */
export function useLiveSnapshot(initial: LiveSnapshot) {
  const [snapshot, setSnapshot] = useState(initial);
  const [changed, setChanged] = useState<ChangeSet>(new Set());
  const [error, setError] = useState(false);
  const current = useRef(initial);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let interval = BASE_INTERVAL;
    let cancelled = false;
    const controller = new AbortController();

    async function poll() {
      if (document.hidden) return;
      try {
        // "no-cache" revalidates every poll; an unchanged feed answers 304 with no body.
        const res = await fetch("/api/live", { signal: controller.signal, cache: "no-cache" });
        if (!res.ok) throw new Error(String(res.status));
        const next = (await res.json()) as LiveSnapshot;
        if (cancelled) return;
        if (next.status === "error") throw new Error("feed unavailable");
        setChanged(diff(current.current, next));
        current.current = next;
        setSnapshot(next);
        setError(false);
        interval = BASE_INTERVAL;
      } catch {
        if (cancelled || controller.signal.aborted) return;
        setError(true);
        interval = Math.min(interval * 2, MAX_INTERVAL);
      }
      schedule();
    }

    function schedule() {
      clearTimeout(timer);
      if (!cancelled && !document.hidden) timer = setTimeout(poll, interval);
    }

    function onVisibility() {
      if (document.hidden) clearTimeout(timer);
      else void poll();
    }

    void poll();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { snapshot, changed, error };
}
