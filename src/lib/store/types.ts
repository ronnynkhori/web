export const collections = [
  "announcements",
  "documents",
  "media",
  "photoLinks",
  "sponsors",
  "faq",
  "guide",
  "venues",
  "countries",
  "schedule",
  "matches",
  "results",
  "medalAdjustments",
  "settings",
  "users",
  "loginAttempts",
] as const;

export type Collection = (typeof collections)[number];

export function isCollection(value: string): value is Collection {
  return (collections as readonly string[]).includes(value);
}

/** Every stored item carries an id and a sort position. */
export interface StoredDoc {
  id: string;
  _order?: number;
  _updatedAt?: string;
  _updatedBy?: string;
  /** Simulated data copied from the demo feed; never official. */
  demo?: boolean;
}

export interface AuditEntry {
  at: string;
  actor: string;
  role: string;
  action: string;
  collection?: string;
  itemId?: string;
  summary?: string;
}

export type UploadTarget =
  | { kind: "signed"; uploadUrl: string; publicUrl: string }
  | { kind: "local"; endpoint: string; publicUrl: string; path: string };

export interface Store {
  readonly kind: "supabase" | "local";
  /** False on Vercel without Supabase: the server filesystem is read-only. */
  readonly writable: boolean;
  /** null when the collection has never been seeded or edited. */
  list<T extends StoredDoc>(collection: Collection): Promise<T[] | null>;
  get<T extends StoredDoc>(collection: Collection, id: string): Promise<T | null>;
  put<T extends StoredDoc>(collection: Collection, doc: T, actor: string): Promise<void>;
  remove(collection: Collection, id: string): Promise<void>;
  replaceAll<T extends StoredDoc>(collection: Collection, docs: T[], actor: string): Promise<void>;
  audit(entry: Omit<AuditEntry, "at">): Promise<void>;
  listAudit(limit: number): Promise<AuditEntry[]>;
  prepareUpload(path: string, contentType: string): Promise<UploadTarget>;
}
