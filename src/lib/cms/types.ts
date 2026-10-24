import type { FaqEntry } from "@/data/faq";
import type { Announcement, DownloadItem, GuideItem, ImageAsset, MediaItem, Venue } from "@/data/types";
import type { ContentStatus } from "@/lib/content";
import type { Localized } from "@/lib/i18n/config";
import type { Match, ResultRow } from "@/lib/live/types";
import type { Phase } from "@/lib/phase";
import type { StoredDoc } from "@/lib/store/types";

export type PublishStatus = "draft" | "published";

export interface AnnouncementDoc extends Announcement, StoredDoc {
  status: PublishStatus;
  /** ISO date-time; the notice stays hidden until then. */
  publishAt?: string;
  /** ISO date-time; the notice is hidden after this. */
  expiresAt?: string;
}

export interface DocumentDoc extends DownloadItem, StoredDoc {
  status: PublishStatus;
  version?: string;
}

export interface MediaDoc extends MediaItem, StoredDoc {
  status: PublishStatus;
  sportId?: string;
  day?: string;
  countryCode?: string;
  /** Safeguarding: photo consent confirmed for every youth athlete shown. */
  consent: boolean;
}

export interface PhotoLinkDoc extends StoredDoc {
  label: Localized;
  url: string;
  day?: string;
  sportId?: string;
}

export type SponsorTierId = "principal" | "official" | "supporters";

export interface SponsorDoc extends StoredDoc {
  name: string;
  tier: SponsorTierId;
  logo?: ImageAsset;
  url?: string;
}

export interface FaqDoc extends FaqEntry, StoredDoc {}
export interface GuideDoc extends GuideItem, StoredDoc {}
export interface VenueDoc extends Venue, StoredDoc {}

export interface CountryDoc extends StoredDoc {
  /** ISO 3166-1 alpha-3, e.g. MOZ. Also picks the built-in flag. */
  code: string;
  name: Localized;
  isHost?: boolean;
  /** Hidden from the public site when false (e.g. a withdrawn delegation). */
  participating: boolean;
  membership: ContentStatus;
  delegationSize: string;
  sportsEntered: string;
  flag?: ImageAsset;
}

export interface ScheduleDoc extends StoredDoc {
  date: string;
  time: string;
  sportId: string;
  event: Localized;
  venue: Localized;
}

export type BannerLevel = "info" | "warning" | "alert";

export interface SettingsDoc extends StoredDoc {
  id: "site";
  /** "auto" follows the calendar; a fixed phase is for previews and the pitch. */
  phase: "auto" | Phase;
  photoDownloadsUrl: string | null;
  banner: {
    enabled: boolean;
    level: BannerLevel;
    message: Localized;
    href?: string;
    linkLabel?: Localized;
  };
}

export type Approval = "draft" | "pending" | "approved" | "rejected";

/**
 * A match keeps the scorer's working copy (`draft`) apart from what the public
 * sees (`published`). Live scores may publish straight away for team sports;
 * final scores always wait for a results manager.
 */
export interface MatchDoc extends StoredDoc {
  draft: Match;
  published: Match | null;
  approval: Approval;
  note?: string;
  venueId?: string;
  submittedBy?: string;
  approvedBy?: string;
  /** Bumped on every score save; two desks on one match must not overwrite each other silently. */
  rev?: number;
}

export interface EventResultRow {
  rank: number;
  athlete: string;
  countryCode: string;
  result: string;
  notes?: string;
}

export interface EventResultDoc extends StoredDoc {
  sportId: string;
  event: Localized;
  /** Medal event: ranks 1-3 count towards the medal table. */
  medalEvent: boolean;
  draft: EventResultRow[];
  published: EventResultRow[] | null;
  approval: Approval;
  corrected?: boolean;
  note?: string;
  submittedBy?: string;
  approvedBy?: string;
  /** Sport/event/medal changes proposed by a scorer; public only once approved. */
  pendingMeta?: { sportId: string; event: Localized; medalEvent: boolean };
}

export interface MedalAdjustmentDoc extends StoredDoc {
  countryCode: string;
  gold: number;
  silver: number;
  bronze: number;
  reason: string;
}

export type Role = "super" | "editor" | "media" | "results" | "scorer";

export interface UserDoc extends StoredDoc {
  email: string;
  name: string;
  role: Role;
  /** Scorers only see these sports. Empty means all. */
  sportIds: string[];
  active: boolean;
  /** Local development store only; Supabase Auth keeps passwords in production. */
  passwordHash?: string;
}

export type PublicResultRow = ResultRow;
