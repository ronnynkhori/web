import "server-only";
import { updateTag } from "next/cache";
import { seedFor } from "@/lib/cms/seed";
import { getStore, type Collection, type StoredDoc } from "@/lib/store";
import type { Session } from "./session";

/** Cache tags refreshed on the public site when a collection changes. */
export function tagsFor(collection: Collection): string[] {
  if (collection === "matches" || collection === "results" || collection === "medalAdjustments") return ["live"];
  return [collection];
}

export class ReadOnlyStoreError extends Error {
  constructor() {
    super("Saving is disabled: connect Supabase (see .env.example). This deployment has a read-only filesystem.");
  }
}

function assertWritable() {
  if (!getStore().writable) throw new ReadOnlyStoreError();
}

/**
 * The first edit to a collection copies the built-in site content in first, so
 * adding one announcement never makes the existing ones disappear.
 */
export async function ensureSeeded(collection: Collection, actor: string): Promise<StoredDoc[]> {
  const store = getStore();
  const existing = await store.list(collection);
  if (existing) return existing;
  const seed = seedFor(collection);
  await store.replaceAll(collection, seed, actor);
  return seed;
}

export async function saveDoc<T extends StoredDoc>(
  collection: Collection,
  doc: T,
  session: Session,
  action: string,
  summary?: string,
): Promise<void> {
  assertWritable();
  const store = getStore();
  const existing = await ensureSeeded(collection, session.email);
  const current = existing.find((d) => d.id === doc.id);
  const order = doc._order ?? current?._order ?? existing.reduce((max, d) => Math.max(max, d._order ?? 0), -1) + 1;
  await store.put(collection, { ...doc, _order: order }, session.email);
  await store.audit({ actor: session.email, role: session.role, action, collection, itemId: doc.id, summary });
  for (const tag of tagsFor(collection)) updateTag(tag);
}

export async function deleteDoc(collection: Collection, id: string, session: Session, summary?: string): Promise<void> {
  assertWritable();
  await ensureSeeded(collection, session.email);
  await getStore().remove(collection, id);
  await getStore().audit({ actor: session.email, role: session.role, action: "deleted", collection, itemId: id, summary });
  for (const tag of tagsFor(collection)) updateTag(tag);
}

/** Removes several items with one audit line; returns how many existed. */
export async function deleteDocs(collection: Collection, ids: string[], session: Session, summary?: string): Promise<number> {
  assertWritable();
  const items = await ensureSeeded(collection, session.email);
  const found = items.filter((d) => ids.includes(d.id));
  for (const doc of found) await getStore().remove(collection, doc.id);
  if (!found.length) return 0;
  await getStore().audit({
    actor: session.email,
    role: session.role,
    action: found.length === 1 ? "deleted" : `deleted ${found.length} items`,
    collection,
    itemId: found.length === 1 ? found[0].id : undefined,
    summary,
  });
  for (const tag of tagsFor(collection)) updateTag(tag);
  return found.length;
}

/** Swap an item with its neighbour to change the order shown on the site. */
export async function moveDoc(collection: Collection, id: string, direction: -1 | 1, session: Session): Promise<void> {
  assertWritable();
  const store = getStore();
  const items = await ensureSeeded(collection, session.email);
  const index = items.findIndex((d) => d.id === id);
  const other = items[index + direction];
  if (index < 0 || !other) return;
  const a = items[index];
  const orderA = a._order ?? index;
  const orderB = other._order ?? index + direction;
  await store.put(collection, { ...a, _order: orderB }, session.email);
  await store.put(collection, { ...other, _order: orderA }, session.email);
  for (const tag of tagsFor(collection)) updateTag(tag);
}

export async function audit(session: Session, action: string, collection?: Collection, itemId?: string, summary?: string) {
  await getStore().audit({ actor: session.email, role: session.role, action, collection, itemId, summary });
}

/** Current items without writing anything: stored copy, or the built-in content. */
export async function loadItems<T extends StoredDoc = StoredDoc>(collection: Collection): Promise<T[]> {
  return ((await getStore().list<T>(collection)) ?? seedFor<T>(collection));
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
