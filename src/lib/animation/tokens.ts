/**
 * Motion tokens for JavaScript (Motion for React / GSAP), read from the same
 * design-tokens.json that generates the CSS variables. No literal durations
 * or easings anywhere else in JS.
 */
import designTokens from "../../../docs/design/design-tokens.json";

const { motion } = designTokens;

type DurationKey = keyof typeof motion.duration;
type EasingKey = Exclude<keyof typeof motion.easing, "linear">;
type StaggerKey = keyof typeof motion.stagger;
type DistanceKey = keyof typeof motion.distance;

const ms = (v: string) => Number.parseFloat(v);

export function duration(key: DurationKey): number {
  return ms(motion.duration[key]);
}

/** Seconds, for Motion/GSAP APIs. */
export function seconds(key: DurationKey): number {
  return duration(key) / 1000;
}

/** cubic-bezier(a, b, c, d) -> [a, b, c, d] for Motion's `ease`. */
export function bezier(key: EasingKey): [number, number, number, number] {
  const nums = motion.easing[key].match(/-?\d*\.?\d+/g)?.map(Number) ?? [0, 0, 1, 1];
  return [nums[0], nums[1], nums[2], nums[3]];
}

/** "cubic-bezier(...)" string for GSAP's CustomEase-free usage via CSS-like strings. */
export function cssEase(key: keyof typeof motion.easing): string {
  return motion.easing[key];
}

export function stagger(key: StaggerKey): number {
  return ms(motion.stagger[key]);
}

export function distance(key: DistanceKey): number {
  return ms(motion.distance[key]);
}

/** Stagger delay for item i, capped by stagger.max-total (600ms). */
export function staggerDelay(index: number, key: Exclude<StaggerKey, "max-total">): number {
  return Math.min(index * stagger(key), stagger("max-total"));
}
