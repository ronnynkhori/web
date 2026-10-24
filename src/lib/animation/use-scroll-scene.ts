"use client";

import { useEffect, useRef, type RefObject } from "react";
import { loadScrollTrigger } from "./gsap";
import { useMotionPreference } from "./motion-preference";

type Gsap = Awaited<ReturnType<typeof loadScrollTrigger>>;

export const SCENE_DESKTOP = "(min-width: 64rem)";
export const SCENE_ANY = "(min-width: 0px)";

/**
 * Runs a GSAP ScrollTrigger scene scoped to `ref` (motion-specifications §3).
 * - GSAP is imported lazily, only when a scene mounts.
 * - Never runs with reduced motion; the static layout is the fallback.
 * - `query` gates the scene (pinning/horizontal scroll are desktop-only);
 *   gsap.matchMedia reverts everything when the query stops matching.
 * - Save-Data skips the scene entirely.
 */
export function useScrollScene<T extends HTMLElement>(
  setup: (api: Gsap & { root: T }) => void | (() => void),
  { query = SCENE_DESKTOP }: { query?: string } = {},
): RefObject<T | null> {
  const ref = useRef<T>(null);
  const { reduced } = useMotionPreference();
  const setupRef = useRef(setup);
  useEffect(() => {
    setupRef.current = setup;
  });

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return;

    let revert: (() => void) | undefined;
    let cancelled = false;
    // Phones never download GSAP unless the viewport later grows into the query.
    const media = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => {
      if (!e.matches) return;
      media.removeEventListener("change", onChange);
      start();
    };
    const start = () => {
      void loadScrollTrigger().then((api) => {
        if (cancelled) return;
        const mm = api.gsap.matchMedia();
        mm.add(query, () => setupRef.current({ ...api, root }), root);
        revert = () => mm.revert();
        api.ScrollTrigger.refresh();
      });
    };
    if (media.matches) start();
    else media.addEventListener("change", onChange);
    return () => {
      cancelled = true;
      media.removeEventListener("change", onChange);
      revert?.();
    };
  }, [reduced, query]);

  return ref;
}
