/**
 * Content-status markers (content-rules.md §1).
 * These strings are detected by `npm run check:release`, which blocks launch
 * while any of them remain in the source tree.
 */
export const CONTENT_REQUIRED = "[CONTENT REQUIRED]";
export const ASSET_REQUIRED = "[ASSET REQUIRED]";
export const DECISION_REQUIRED = "[DECISION REQUIRED]";
export const CLIENT_TO_CONFIRM = "[CLIENT TO CONFIRM]";

const MARKER = /^\[(CONTENT REQUIRED|ASSET REQUIRED|DECISION REQUIRED|CLIENT TO CONFIRM|PT REVIEW|FR REVIEW)[^\]]*\]/;

/** True when a value is (or starts with) an unresolved content marker. */
export function isPending(value: string | null | undefined): boolean {
  return !value || MARKER.test(value.trim());
}

/** Lifecycle of a fact relative to its approved source. */
export type ContentStatus =
  | "confirmed" // approved by client / LOC
  | "source" // stated in the CDM, not yet signed off
  | "conflict" // sources disagree - never pick one silently
  | "required"; // missing
