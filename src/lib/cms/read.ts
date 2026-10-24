/**
 * Public read layer. Each function is cached and tagged with its collection so
 * a Control Room save (updateTag) shows on the next request. If the database is
 * empty or unreachable the built-in content from src/data is served instead.
 */
import { cacheLife, cacheTag } from "next/cache";
import { countries as builtInCountries } from "@/data/countries";
import { retiredSamples } from "@/data/news";
import type { Country } from "@/data/types";
import { CONTENT_REQUIRED } from "@/lib/content";
import { getStore, type Collection, type StoredDoc } from "@/lib/store";
import { defaultSettings, seedFor } from "./seed";
import type {
  AnnouncementDoc,
  CountryDoc,
  DocumentDoc,
  FaqDoc,
  GuideDoc,
  MediaDoc,
  PhotoLinkDoc,
  ScheduleDoc,
  SettingsDoc,
  SponsorDoc,
  VenueDoc,
} from "./types";

async function load<T extends StoredDoc>(collection: Collection): Promise<T[]> {
  try {
    return (await getStore().list<T>(collection)) ?? seedFor<T>(collection);
  } catch (error) {
    console.error(`[cms] reading ${collection} failed, serving built-in content`, error);
    return seedFor<T>(collection);
  }
}

const live = (now: number) => (a: AnnouncementDoc) =>
  a.status === "published" &&
  (!a.publishAt || Date.parse(a.publishAt) <= now) &&
  (!a.expiresAt || Date.parse(a.expiresAt) > now);

export async function getAnnouncements(): Promise<AnnouncementDoc[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("announcements");
  // Untouched copies of the old placeholder notices are swapped for the built-in ones until a refresh rewrites the store.
  const placeholder = (a: AnnouncementDoc) => a.sample || (a.ref !== undefined && retiredSamples[a.id] === a.ref);
  const stored = await load<AnnouncementDoc>("announcements");
  const kept = stored.filter((a) => !placeholder(a));
  const ids = new Set(stored.map((a) => a.id));
  const builtIn = kept.length < stored.length ? seedFor<AnnouncementDoc>("announcements").filter((a) => !ids.has(a.id)) : [];
  return [...kept, ...builtIn].filter(live(Date.now()));
}

export async function getDocuments(): Promise<DocumentDoc[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("documents");
  return (await load<DocumentDoc>("documents")).filter((d) => d.status === "published");
}

export async function getMedia(): Promise<MediaDoc[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("media");
  const published = (await load<MediaDoc>("media")).filter((m) => m.status === "published" && m.consent);
  // The current photos stay up as placeholders until the media team publishes real ones.
  return published.length ? published : seedFor<MediaDoc>("media");
}

export async function getPhotoLinks(): Promise<PhotoLinkDoc[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("photoLinks");
  return (await load<PhotoLinkDoc>("photoLinks")).filter((l) => l.url);
}

export async function getSponsors(): Promise<SponsorDoc[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("sponsors");
  return load<SponsorDoc>("sponsors");
}

export async function getFaq(): Promise<FaqDoc[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("faq");
  return load<FaqDoc>("faq");
}

export async function getGuide(): Promise<GuideDoc[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("guide");
  return (await load<GuideDoc>("guide")).filter((g) => g.status !== "required");
}

export async function getVenues(): Promise<VenueDoc[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("venues");
  const placeholders = new Map(seedFor<VenueDoc>("venues").map((v) => [v.id, v.image]));
  // A venue keeps its current photo as a placeholder until a new one is uploaded.
  return (await load<VenueDoc>("venues")).map((v) => (v.image?.src ? v : { ...v, image: placeholders.get(v.id) ?? v.image }));
}

/** Participating nations, in the order set in the Control Room. */
export async function getCountries(): Promise<Country[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("countries");
  const builtInFlags = new Map(builtInCountries.map((c) => [c.code, c.flag]));
  return (await load<CountryDoc>("countries"))
    .filter((c) => c.participating !== false)
    .map((c) => {
      const code = c.code.toUpperCase();
      return {
        code,
        name: c.name,
        isHost: c.isHost,
        membership: c.membership,
        delegationSize: c.delegationSize || CONTENT_REQUIRED,
        sportsEntered: c.sportsEntered || CONTENT_REQUIRED,
        flag: c.flag?.src ? c.flag : builtInFlags.get(code),
        isDemo: !c.delegationSize || c.delegationSize === CONTENT_REQUIRED,
      };
    });
}

/** Every known nation's flag, including withdrawn ones that still appear in past results. */
export async function getCountryFlags(): Promise<Array<Pick<Country, "code" | "name" | "flag">>> {
  "use cache";
  cacheLife("hours");
  cacheTag("countries");
  const docs = await load<CountryDoc>("countries");
  const list = docs.map((c) => {
    const code = c.code.toUpperCase();
    return { code, name: c.name, flag: c.flag?.src ? c.flag : builtInCountries.find((b) => b.code === code)?.flag };
  });
  for (const b of builtInCountries) if (!list.some((c) => c.code === b.code)) list.push({ code: b.code, name: b.name, flag: b.flag });
  return list;
}

export async function getSchedule(): Promise<ScheduleDoc[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("schedule");
  return (await load<ScheduleDoc>("schedule")).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}

export async function getSettings(): Promise<SettingsDoc> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");
  const [stored] = await load<SettingsDoc>("settings");
  return { ...defaultSettings, ...stored, banner: { ...defaultSettings.banner, ...stored?.banner } };
}
