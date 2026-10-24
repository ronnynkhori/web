/**
 * Lazy GSAP loader. GSAP is only used for scroll storytelling, pinning and Flip
 * (motion-specifications §3), so it is dynamically imported by the few client
 * components that need it and never lands in the initial bundle.
 */
import designTokens from "../../../docs/design/design-tokens.json";
import { prefersReducedMotion } from "./motion-preference";

export const DESKTOP_QUERY = "(min-width: 64rem)";

type EaseKey = Exclude<keyof typeof designTokens.motion.easing, "linear">;

/** Token easings registered as GSAP eases: ease("emphasized") -> "m26-emphasized". */
export const ease = (key: EaseKey) => `m26-${key}`;

let eased = false;

async function registerEases(gsap: typeof import("gsap").gsap) {
  if (eased) return;
  const { CustomEase } = await import("gsap/CustomEase");
  gsap.registerPlugin(CustomEase);
  for (const [key, value] of Object.entries(designTokens.motion.easing)) {
    const nums = value.match(/-?\d*\.?\d+/g);
    if (key === "linear" || !nums || nums.length < 4) continue;
    CustomEase.create(`m26-${key}`, `M0,0 C${nums[0]},${nums[1]} ${nums[2]},${nums[3]} 1,1`);
  }
  eased = true;
}

export async function loadScrollTrigger() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
  gsap.registerPlugin(ScrollTrigger);
  await registerEases(gsap);
  return { gsap, ScrollTrigger };
}

export async function loadFlip() {
  const [{ gsap }, { Flip }] = await Promise.all([import("gsap"), import("gsap/Flip")]);
  gsap.registerPlugin(Flip);
  await registerEases(gsap);
  return { gsap, Flip };
}

/** Pinning and parallax only on desktop with full motion (motion §5.3, §7). */
export function canRunCinematicScroll(): boolean {
  if (typeof window === "undefined") return false;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return window.matchMedia(DESKTOP_QUERY).matches && !prefersReducedMotion() && !saveData;
}
