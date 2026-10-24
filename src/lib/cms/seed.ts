/**
 * Built-in content for every collection. It is what the public site shows until
 * a collection is first edited, and what "Load site content" copies into the
 * database so editors start from the current site rather than a blank page.
 */
import { countries } from "@/data/countries";
import { faq } from "@/data/faq";
import { downloads, guide } from "@/data/guide";
import { demoMatches, demoMedalBase, demoResults } from "@/data/live-demo";
import { media, photoDownloadsUrl } from "@/data/media";
import { announcements } from "@/data/news";
import { venues } from "@/data/venues";
import { CONTENT_REQUIRED } from "@/lib/content";
import type { Localized } from "@/lib/i18n/config";
import { demoSeedEnabled } from "@/lib/live/demo-mode";
import { DEMO_PHASE } from "@/lib/phase";
import type { Collection, StoredDoc } from "@/lib/store/types";
import type {
  AnnouncementDoc,
  CountryDoc,
  DocumentDoc,
  EventResultDoc,
  FaqDoc,
  GuideDoc,
  MatchDoc,
  MedalAdjustmentDoc,
  MediaDoc,
  SettingsDoc,
  VenueDoc,
} from "./types";

const empty: Localized = { en: "", pt: "", fr: "" };

export const defaultSettings: SettingsDoc = {
  id: "site",
  phase: DEMO_PHASE ?? "auto",
  photoDownloadsUrl,
  banner: { enabled: false, level: "info", message: empty, href: "", linkLabel: empty },
};

function seedResults(): EventResultDoc[] {
  const byEvent = new Map<string, EventResultDoc>();
  for (const row of demoResults) {
    const key = row.event.en;
    let doc = byEvent.get(key);
    if (!doc) {
      doc = {
        id: `ev-${byEvent.size + 1}`,
        sportId: row.sportId,
        event: row.event,
        medalEvent: true,
        draft: [],
        published: [],
        approval: "approved",
        demo: true,
      };
      byEvent.set(key, doc);
    }
    const entry = {
      rank: row.rank,
      athlete: row.athlete.en,
      countryCode: row.countryCode,
      result: row.result,
      notes: row.notes?.en,
    };
    doc.draft.push(entry);
    doc.published!.push(entry);
  }
  return [...byEvent.values()];
}

const seeds: Partial<Record<Collection, () => StoredDoc[]>> = {
  announcements: () =>
    announcements.map((a): AnnouncementDoc => ({ ...a, status: "published" })),
  documents: () => downloads.map((d): DocumentDoc => ({ ...d, status: "published" })),
  media: () => media.map((m): MediaDoc => ({ ...m, status: "published", consent: true })),
  photoLinks: () => [],
  sponsors: () => [],
  faq: () => faq.map((f): FaqDoc => ({ ...f })),
  guide: () => guide.map((g): GuideDoc => ({ ...g })),
  venues: () => venues.map((v): VenueDoc => ({ ...v })),
  countries: () =>
    countries.map(({ code, name, isHost, membership, flag, delegationSize, sportsEntered }): CountryDoc => ({
      code,
      name,
      isHost,
      membership,
      flag,
      id: code.toLowerCase(),
      participating: true,
      delegationSize: delegationSize === CONTENT_REQUIRED ? "" : delegationSize,
      sportsEntered: sportsEntered === CONTENT_REQUIRED ? "" : sportsEntered,
    })),
  schedule: () => [],
  // Results start empty in production: simulated scores must never become official records.
  matches: () =>
    demoSeedEnabled()
      ? demoMatches.map((m): MatchDoc => ({ id: m.id, draft: m, published: m, approval: "approved", demo: true }))
      : [],
  results: () => (demoSeedEnabled() ? seedResults() : []),
  medalAdjustments: () =>
    demoSeedEnabled()
      ? demoMedalBase.map(([countryCode, gold, silver, bronze]): MedalAdjustmentDoc => ({
          id: `adj-${countryCode.toLowerCase()}`,
          countryCode,
          gold,
          silver,
          bronze,
          reason: "Demo medals (simulated, not official)",
          demo: true,
        }))
      : [],
  settings: () => [defaultSettings],
};

export function seedFor<T extends StoredDoc>(collection: Collection): T[] {
  return (seeds[collection]?.() ?? []).map((d, i) => ({ ...d, _order: i })) as T[];
}

export const seedableCollections = Object.keys(seeds) as Collection[];
