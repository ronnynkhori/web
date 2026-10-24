"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/admin/auth";
import { getT } from "@/lib/admin/i18n/server";
import type { Translate } from "@/lib/admin/i18n/translate";
import { deleteDoc, deleteDocs, ensureSeeded, loadItems, moveDoc, newId, saveDoc } from "@/lib/admin/mutate";
import { parseFields, type FieldErrors } from "@/lib/admin/parse";
import { getCollectionDef } from "@/lib/admin/schemas";
import { getStore, type StoredDoc, type UploadTarget } from "@/lib/store";

export interface FormState {
  message?: string;
  errors?: FieldErrors;
}

const errorMessage = (error: unknown, t: Translate) => t(error instanceof Error ? error.message : "Something went wrong. Try again.");

export async function saveItem(collection: string, id: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  const t = await getT();
  const def = getCollectionDef(collection);
  if (!def) return { message: t("Unknown collection.") };
  const session = await requireUser(def.area);

  const { values, errors } = parseFields(def.fields, form, t);
  if (def.id === "countries" && typeof values.code === "string") {
    const code = values.code.trim().toUpperCase();
    values.code = code;
    if (!/^[A-Z]{3}$/.test(code)) errors.code = t("Use the three-letter code, e.g. MOZ.");
  }
  if (Object.keys(errors).length) return { errors, message: t("Please fix the highlighted fields.") };

  const docId = id ?? newId(def.idPrefix);
  try {
    const items = await loadItems(def.id);
    const existing = items.find((d) => d.id === docId);
    if (def.id === "countries" && items.some((d) => d.id !== docId && (d as { code?: string }).code === values.code)) {
      return { errors: { code: t("Another country already uses this code.") }, message: t("Please fix the highlighted fields.") };
    }
    const doc = { ...def.defaults(), ...existing, ...values, id: docId } as StoredDoc & Record<string, unknown>;

    if (def.id === "announcements" && doc.pinned) {
      await ensureSeeded(def.id, session.email);
      for (const other of items) {
        if (other.id !== docId && (other as { pinned?: boolean }).pinned) {
          await saveDoc(def.id, { ...other, pinned: false }, session, "unpinned", "Another notice was pinned");
        }
      }
    }

    const title = def.title(doc);
    await saveDoc(def.id, doc, session, existing ? "updated" : "created", title);
  } catch (error) {
    return { message: errorMessage(error, t) };
  }
  redirect(`/admin/c/${def.id}?saved=${encodeURIComponent(docId)}`);
}

export async function deleteItem(collection: string, id: string): Promise<void> {
  const def = getCollectionDef(collection);
  if (!def) return;
  const session = await requireUser(def.area);
  const items = await loadItems(def.id);
  const doc = items.find((d) => d.id === id);
  await deleteDoc(def.id, id, session, doc ? def.title(doc as unknown as Record<string, unknown>) : id);
  redirect(`/admin/c/${def.id}?deleted=1`);
}

export type BulkResult = { count: number } | { error: string };

export async function deleteItems(collection: string, ids: string[]): Promise<BulkResult> {
  const t = await getT();
  const def = getCollectionDef(collection);
  if (!def) return { error: t("Unknown collection.") };
  const session = await requireUser(def.area);
  if (!Array.isArray(ids) || !ids.length) return { count: 0 };
  try {
    const items = await loadItems(def.id);
    const titles = items.filter((d) => ids.includes(d.id)).map((d) => def.title(d as unknown as Record<string, unknown>));
    const count = await deleteDocs(def.id, ids.map(String).slice(0, 500), session, titles.slice(0, 5).join(", ") + (titles.length > 5 ? "…" : ""));
    return { count };
  } catch (error) {
    return { error: errorMessage(error, t) };
  }
}

export async function moveItem(collection: string, id: string, direction: -1 | 1): Promise<void> {
  const def = getCollectionDef(collection);
  if (!def) return;
  const session = await requireUser(def.area);
  await moveDoc(def.id, id, direction, session);
}

const UPLOAD_ROLES = new Set(["super", "editor", "media"]);
const ALLOWED = /^(image\/(jpeg|png|webp|svg\+xml)|application\/pdf)$/;
const ALLOWED_EXT = /\.(jpe?g|png|webp|svg|pdf)$/;
/** Matches the games-media bucket limit (supabase/migrations/0002_upload_limits.sql). */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function slug(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "bin";
  return `${base || "file"}.${ext}`;
}

/** Returns where the browser should send the file: a signed Supabase URL, or the local dev endpoint. */
export async function prepareUpload(folder: string, fileName: string, contentType: string, size: number): Promise<UploadTarget | { error: string }> {
  const session = await requireUser();
  const t = await getT();
  if (!UPLOAD_ROLES.has(session.role)) return { error: t("Your role cannot upload files.") };
  if (!ALLOWED.test(contentType) || !ALLOWED_EXT.test(slug(fileName))) return { error: t("Use a JPG, PNG, WebP or SVG image, or a PDF.") };
  if (!(size > 0 && size <= MAX_UPLOAD_BYTES)) return { error: t("Files must be under 25 MB.") };
  const store = getStore();
  if (!store.writable) return { error: t("Uploads need Supabase on this deployment.") };
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "") || "misc";
  const path = `${safeFolder}/${Date.now().toString(36)}-${slug(fileName)}`;
  try {
    return await store.prepareUpload(path, contentType);
  } catch (error) {
    return { error: errorMessage(error, t) };
  }
}
