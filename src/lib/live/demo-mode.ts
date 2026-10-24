import { demoResults } from "@/data/live-demo";
import type { StoredDoc } from "@/lib/store/types";

/**
 * DEMO_DATA controls the simulated results feed:
 * - "0": no demo anywhere (the hub shows an empty state until real results exist);
 * - "1": demo feed shown and copied into the database on first edit (local pitches);
 * - unset: demo feed shown read-only and labelled DEMO, never written to the database
 *   in production. Local development (`next dev`) still seeds it for testing.
 */
export function demoFeedEnabled(): boolean {
  return process.env.DEMO_DATA !== "0";
}

export function demoSeedEnabled(): boolean {
  const flag = process.env.DEMO_DATA;
  if (flag === "1") return true;
  if (flag === "0") return false;
  return process.env.NODE_ENV !== "production";
}

const demoEvents = new Set(demoResults.map((r) => r.event.en));

/** Demo rows seeded before the `demo` flag existed are recognised by their ids and wording. */
export function isDemoDoc(doc: StoredDoc & { reason?: string; event?: { en: string } }): boolean {
  if (doc.demo) return true;
  if (doc.id.startsWith("demo-")) return true;
  if (/^ev-\d+$/.test(doc.id) && doc.event && demoEvents.has(doc.event.en)) return true;
  return doc.id.startsWith("adj-") && /results office spreadsheet/i.test(doc.reason ?? "");
}
