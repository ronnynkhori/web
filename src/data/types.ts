import type { ContentStatus } from "@/lib/content";
import type { Localized } from "@/lib/i18n/config";

/** Brand fill used for placeholder art and bands until photography is supplied. */
export type Tone = "energy" | "region" | "highlight" | "premium" | "neutral";

export interface Fact<T = string> {
  value: T;
  status: ContentStatus;
  /** Where the fact comes from, e.g. "CDM p.29". Shown to editors, not users. */
  source?: string;
  note?: string;
}

export interface ImageAsset {
  src: string;
  width: number;
  height: number;
  alt: Localized;
  credit?: string;
  /** Focal point kept in view when the frame crops the photo (CSS object-position). */
  focus?: string;
  /** Stand-in for the pitch (stock or AI-generated); never shown as event photography. */
  isDemo?: boolean;
}

export interface Sport {
  id: string;
  name: Localized;
  category: "track" | "aquatics" | "team" | "combat" | "court" | "racket" | "beach" | "mind" | "digital";
  status: ContentStatus;
  tone: Tone;
  image?: ImageAsset;
  /** Official mascot pose for this sport (transparent PNG). */
  mascot?: { src: string; width: number; height: number };
  /** Competition plan; absent where it is not yet known. */
  programme?: SportProgramme;
}

export interface SportProgramme {
  /** Competition days, ISO dates (CDM Table 12). */
  days: string[];
  /** Rest days inside the competition window. */
  rest?: string[];
  /** Venue ids from src/data/venues.ts (CDM Table 13). */
  venues?: string[];
  /** Birth-date rule (CDM Table 7). */
  eligibility?: Localized;
  /** Maximum entries per nation (CDM Table 8). */
  quota?: { men: number; women: number; staff: number; judges: number; total: number };
  /** Where the delegations for this sport stay. */
  lodging?: Localized;
  /** Participants for the sport; `group` names the shared total when several sports are counted together. */
  participants?: { n: number; group?: Localized };
  /** Broadcast mode (CDM Table 12). */
  broadcast?: "live" | "live-delayed" | "live-semis" | "live-semis-delayed" | "delayed" | "eng";
  /** Extra events or notes, e.g. para athletics classes. */
  note?: Localized;
}

export interface Country {
  code: string; // ISO 3166-1 alpha-3
  name: Localized;
  isHost?: boolean;
  /** CPLP membership. */
  membership: ContentStatus;
  delegationSize: string;
  sportsEntered: string;
  flag?: ImageAsset;
  isDemo: boolean;
}

export interface Venue {
  id: string;
  name: Localized;
  role: Localized;
  sports: Localized;
  area: Localized;
  status: ContentStatus;
  tone: Tone;
  image?: ImageAsset;
  address?: string;
  mapUrl?: string;
  /** Spread over several sites (e.g. accommodation), so there is no single map pin. */
  noMap?: boolean;
  accessibility?: Localized;
}

export type AnnouncementKind = "important" | "deadline" | "update" | "notice";

export interface Announcement {
  id: string;
  /** LOC reference number printed on the notice. */
  ref?: string;
  kind: AnnouncementKind;
  title: Localized;
  body: Localized;
  audience: Localized;
  publishedAt?: string;
  /** ISO date the notice closes or takes effect. */
  deadline?: string;
  pinned?: boolean;
  action?: { href: string; label: Localized; external?: boolean };
  /** Placeholder written for the pitch; shown with a "Sample" label until the LOC replaces it. */
  sample?: boolean;
}

export interface MediaItem {
  id: string;
  type: "photo" | "video";
  title: Localized;
  credit: string;
  durationSeconds?: number | null;
  ratio: "landscape" | "portrait" | "square";
  tone: Tone;
  image?: ImageAsset;
  videoSrc?: string;
  captionsSrc?: Localized;
}

export interface GuideItem {
  id: string;
  title: Localized;
  body: Localized<string[]>;
  status: ContentStatus;
}

export interface DownloadItem {
  id: string;
  title: Localized;
  fileType: string;
  size: string;
  language: string;
  href: string | null;
}

export interface StoryBeat {
  id: string;
  kicker: Localized;
  headline: Localized;
  body: Localized;
  date?: string;
  status: ContentStatus;
  tone: Tone;
  image?: ImageAsset;
  /** Short location tag shown on the photo. */
  place?: Localized;
  /** Two or three headline figures shown under the copy. */
  facts?: Array<{ value: Localized; label: Localized }>;
}

export interface SponsorTier {
  id: "institutional" | "agency" | "principal" | "official" | "supporters";
  slots: number;
}
