"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "./motion-preference";
import { bezier, duration } from "./tokens";

function cubic([x1, y1, x2, y2]: [number, number, number, number]) {
  // Newton-Raphson solve of a CSS cubic-bezier for t -> eased progress.
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= (sx(t) - x) / d;
    }
    return sy(Math.min(1, Math.max(0, t)));
  };
}

/**
 * Count up once when 40% visible (motion concept 18): ~900ms emphasized.
 * Reduced motion shows the final value immediately.
 */
export function useCountUp(target: number) {
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState(target);
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) {
      setValue(target);
      return;
    }
    setValue(0);
    const ease = cubic(bezier("emphasized"));
    const total = duration("content-slow");
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / total);
          setValue(Math.round(target * ease(p)));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, reduced]);

  return { ref, value };
}
