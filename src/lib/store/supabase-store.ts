import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AuditEntry, Collection, Store, StoredDoc, UploadTarget } from "./types";

export const MEDIA_BUCKET = "games-media";

interface Row {
  id: string;
  data: StoredDoc;
  updated_at: string;
  updated_by: string | null;
}

const fromRow = <T extends StoredDoc>(row: Row): T =>
  ({ ...row.data, id: row.id, _updatedAt: row.updated_at, _updatedBy: row.updated_by ?? undefined }) as T;

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Supabase: ${result.error.message}`);
  return result.data;
}

/** Production store. Uses the service-role key, so it must only run on the server. */
export class SupabaseStore implements Store {
  readonly kind = "supabase" as const;
  readonly writable = true;
  readonly client: SupabaseClient;

  constructor(url: string, serviceKey: string) {
    this.client = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }

  async list<T extends StoredDoc>(collection: Collection): Promise<T[] | null> {
    const known = check(
      await this.client.from("content_collections").select("collection").eq("collection", collection).maybeSingle(),
    );
    if (!known) return null;
    const rows = check(
      await this.client.from("content_items").select("id, data, updated_at, updated_by").eq("collection", collection),
    ) as Row[];
    return rows.map((r) => fromRow<T>(r)).sort((a, b) => (a._order ?? 0) - (b._order ?? 0));
  }

  async get<T extends StoredDoc>(collection: Collection, id: string): Promise<T | null> {
    const row = check(
      await this.client
        .from("content_items")
        .select("id, data, updated_at, updated_by")
        .eq("collection", collection)
        .eq("id", id)
        .maybeSingle(),
    ) as Row | null;
    return row ? fromRow<T>(row) : null;
  }

  async put<T extends StoredDoc>(collection: Collection, doc: T, actor: string): Promise<void> {
    const { _updatedAt, _updatedBy, ...data } = doc;
    void _updatedAt;
    void _updatedBy;
    check(
      await this.client
        .from("content_items")
        .upsert({ collection, id: doc.id, data, updated_at: new Date().toISOString(), updated_by: actor }),
    );
    check(await this.client.from("content_collections").upsert({ collection }, { ignoreDuplicates: true }));
  }

  async remove(collection: Collection, id: string): Promise<void> {
    check(await this.client.from("content_items").delete().eq("collection", collection).eq("id", id));
  }

  async replaceAll<T extends StoredDoc>(collection: Collection, docs: T[], actor: string): Promise<void> {
    const at = new Date().toISOString();
    check(await this.client.from("content_items").delete().eq("collection", collection));
    if (docs.length) {
      check(
        await this.client.from("content_items").insert(
          docs.map((d, i) => {
            const { _updatedAt, _updatedBy, ...data } = d;
            void _updatedAt;
            void _updatedBy;
            return { collection, id: d.id, data: { ...data, _order: d._order ?? i }, updated_at: at, updated_by: actor };
          }),
        ),
      );
    }
    check(await this.client.from("content_collections").upsert({ collection }, { ignoreDuplicates: true }));
  }

  async audit(entry: Omit<AuditEntry, "at">): Promise<void> {
    check(
      await this.client.from("audit_log").insert({
        actor: entry.actor,
        role: entry.role,
        action: entry.action,
        collection: entry.collection ?? null,
        item_id: entry.itemId ?? null,
        summary: entry.summary ?? null,
      }),
    );
  }

  async listAudit(limit: number): Promise<AuditEntry[]> {
    const rows = check(
      await this.client
        .from("audit_log")
        .select("at, actor, role, action, collection, item_id, summary")
        .order("at", { ascending: false })
        .limit(limit),
    ) as Array<{ at: string; actor: string; role: string; action: string; collection: string | null; item_id: string | null; summary: string | null }>;
    return rows.map((r) => ({
      at: r.at,
      actor: r.actor,
      role: r.role,
      action: r.action,
      collection: r.collection ?? undefined,
      itemId: r.item_id ?? undefined,
      summary: r.summary ?? undefined,
    }));
  }

  async prepareUpload(path: string): Promise<UploadTarget> {
    const bucket = this.client.storage.from(MEDIA_BUCKET);
    const signed = check(await bucket.createSignedUploadUrl(path, { upsert: true }));
    if (!signed) throw new Error("Supabase: no signed upload URL returned");
    return { kind: "signed", uploadUrl: signed.signedUrl, publicUrl: bucket.getPublicUrl(path).data.publicUrl };
  }
}
