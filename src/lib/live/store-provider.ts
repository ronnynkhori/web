import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { countries } from "@/data/countries";
import type { CountryDoc, EventResultDoc, MatchDoc, MedalAdjustmentDoc } from "@/lib/cms/types";
import type { Localized } from "@/lib/i18n/config";
import { seedFor } from "@/lib/cms/seed";
import { getStore } from "@/lib/store";
import { isDemoDoc } from "./demo-mode";
import { computeMedals } from "./medals";
import type { LiveSnapshot, Match, ResultRow } from "./types";

const same = (text: string) => ({ en: text, pt: text, fr: text });

function publicResults(events: EventResultDoc[], names: Map<string, Localized>): ResultRow[] {
  return [...events]
    .filter((e) => e.published?.length)
    .sort((a, b) => (b._updatedAt ?? "").localeCompare(a._updatedAt ?? ""))
    .flatMap((e) =>
      [...e.published!]
        .sort((a, b) => a.rank - b.rank)
        .map((r, i) => {
          return {
            id: `${e.id}-${i}`,
            sportId: e.sportId,
            event: e.event,
            rank: r.rank,
            athlete: same(r.athlete),
            countryCode: r.countryCode,
            country: names.get(r.countryCode) ?? same(r.countryCode),
            result: r.result,
            notes: r.notes ? same(r.notes) : null,
            winner: r.rank === 1,
            corrected: e.corrected || undefined,
          };
        }),
    );
}

function publicMatches(docs: MatchDoc[]): Match[] {
  const order = { live: 0, upcoming: 1, finished: 2, postponed: 3, cancelled: 4 } as const;
  return docs
    .filter((d) => d.published)
    .map((d) => d.published!)
    .sort((a, b) => order[a.status] - order[b.status]);
}

/**
 * Live snapshot from the Control Room, or null while results have never been
 * entered (the site then keeps the demo feed). Cached briefly and refreshed the
 * moment a score is saved (tag "live").
 */
export async function getStoreSnapshot(): Promise<LiveSnapshot | null> {
  "use cache";
  cacheLife({ stale: 10, revalidate: 15, expire: 300 });
  cacheTag("live", "countries");

  const store = getStore();
  const [matches, results, adjustments, countryDocs] = await Promise.all([
    store.list<MatchDoc>("matches"),
    store.list<EventResultDoc>("results"),
    store.list<MedalAdjustmentDoc>("medalAdjustments"),
    store.list<CountryDoc>("countries"),
  ]);
  if (!matches && !results) return null;
  const events = results ?? seedFor<EventResultDoc>("results");
  const matchDocs = matches ?? seedFor<MatchDoc>("matches");
  const adjustmentDocs = adjustments ?? seedFor<MedalAdjustmentDoc>("medalAdjustments");
  const names = new Map(countries.map((c) => [c.code, c.name]));
  for (const c of countryDocs ?? []) names.set(c.code.toUpperCase(), c.name);

  return {
    updatedAt: new Date().toISOString(),
    status: "ok",
    isDemo: [...matchDocs, ...events, ...adjustmentDocs].some(isDemoDoc),
    matches: publicMatches(matchDocs),
    medals: computeMedals(events, adjustmentDocs, names),
    results: publicResults(events, names),
  };
}
