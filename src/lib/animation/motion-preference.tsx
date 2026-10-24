"use client";

import { MotionConfig } from "motion/react";
import { createContext, useCallback, useContext, useLayoutEffect, useState, type ReactNode } from "react";
import { MOTION_STORAGE_KEY, THEME_STORAGE_KEY } from "./storage-keys";

export type MotionMode = "full" | "reduce";

interface MotionPreference {
  reduced: boolean;
  setReduced: (value: boolean) => void;
}

const MotionPreferenceContext = createContext<MotionPreference>({ reduced: false, setReduced: () => {} });

function readMode(): MotionMode {
  const attr = document.documentElement.dataset.motion;
  return attr === "reduce" ? "reduce" : "full";
}

/**
 * The single source of truth for motion (motion-specifications.md §4).
 * html[data-motion] is set before paint by the inline boot script from the OS
 * setting or the stored footer toggle; this provider mirrors it into React and
 * into Motion's MotionConfig. Components never query the media feature directly.
 */
export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const [reduced, setReducedState] = useState(false);

  useLayoutEffect(() => {
    // Re-apply after a dev-mode Strict remount clears attributes set by the boot script.
    const stored = localStorage.getItem(MOTION_STORAGE_KEY);
    const os = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      const mode: MotionMode = stored === "reduce" || stored === "full" ? stored : os.matches ? "reduce" : "full";
      document.documentElement.dataset.motion = mode;
      document.documentElement.classList.add("js");
      setReducedState(mode === "reduce");
    };
    apply();
    const theme = localStorage.getItem(THEME_STORAGE_KEY);
    if (theme === "light" || theme === "dark") document.documentElement.dataset.theme = theme;
    os.addEventListener("change", apply);
    return () => os.removeEventListener("change", apply);
  }, []);

  const setReduced = useCallback((value: boolean) => {
    const mode: MotionMode = value ? "reduce" : "full";
    localStorage.setItem(MOTION_STORAGE_KEY, mode);
    document.documentElement.dataset.motion = mode;
    setReducedState(value);
  }, []);

  return (
    <MotionPreferenceContext.Provider value={{ reduced, setReduced }}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>
    </MotionPreferenceContext.Provider>
  );
}

export function useMotionPreference(): MotionPreference {
  return useContext(MotionPreferenceContext);
}

/** Imperative check for effects that run outside React state (GSAP setup). */
export function prefersReducedMotion(): boolean {
  return typeof document !== "undefined" && readMode() === "reduce";
}
