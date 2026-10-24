import { revalidateTag } from "next/cache";
import { getSession } from "@/lib/admin/auth";
import type { UserDoc } from "@/lib/cms/types";
import { getStore } from "@/lib/store";
import { collections, type Collection, type StoredDoc } from "@/lib/store/types";

/** Vercel functions accept request bodies up to about 4.5 MB. */
const MAX_BYTES = 4 * 1024 * 1024;

const back = (request: Request, param: string) => Response.redirect(new URL(`/admin/settings?${param}`, request.url), 303);

/**
 * Restores a backup made with "Download a full backup". Every collection in
 * the file replaces the stored one. Password hashes are not in backups, so
 * existing users keep their current password.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "super") return back(request, "denied=1");
  const store = getStore();
  if (!store.writable) return back(request, "readonly=1");

  const form = await request.formData();
  const file = form.get("backup");
  if (form.get("confirm") !== "yes" || !(file instanceof File) || file.size === 0 || file.size > MAX_BYTES) {
    return back(request, "restoreFailed=1");
  }

  let data: Partial<Record<Collection, StoredDoc[]>>;
  try {
    const parsed = JSON.parse(await file.text()) as { collections?: Record<string, unknown> };
    data = parsed.collections as typeof data;
    if (!data || typeof data !== "object") throw new Error("No collections");
  } catch {
    return back(request, "restoreFailed=1");
  }

  const restorable = collections.filter((c) => c !== "loginAttempts");
  const valid = (items: unknown): items is StoredDoc[] =>
    Array.isArray(items) && items.every((d) => d && typeof d === "object" && typeof (d as StoredDoc).id === "string");
  if (!restorable.some((c) => c in data) || !restorable.every((c) => !(c in data) || valid(data[c]))) {
    return back(request, "restoreFailed=1");
  }

  const currentUsers = (await store.list<UserDoc>("users")) ?? [];
  let restored = 0;
  for (const collection of restorable) {
    let items = data[collection];
    if (!items) continue;
    if (collection === "users") {
      const hashes = new Map(currentUsers.map((u) => [u.email, u.passwordHash]));
      items = (items as UserDoc[]).map((u) => ({ ...u, passwordHash: hashes.get(u.email) }));
    }
    await store.replaceAll(collection, items.map((d, i) => ({ ...d, _order: i })), session.email);
    revalidateTag(collection, { expire: 0 });
    restored += 1;
  }
  revalidateTag("live", { expire: 0 });
  await store.audit({ actor: session.email, role: session.role, action: "restored backup", summary: `${restored} collections from ${file.name}` });
  return back(request, "restored=1");
}
