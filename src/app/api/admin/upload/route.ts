import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/admin/auth";
import { getStore } from "@/lib/store";
import { LOCAL_DATA_DIR } from "@/lib/store/local-store";

const MAX_BYTES = 25 * 1024 * 1024;
const UPLOAD_ROLES = new Set(["super", "editor", "media"]);

/** Development-only upload target. On Vercel the browser uploads straight to Supabase Storage. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !UPLOAD_ROLES.has(session.role)) return Response.json({ error: "Not allowed." }, { status: 403 });
  const store = getStore();
  if (store.kind !== "local" || !store.writable) return Response.json({ error: "Local uploads are disabled." }, { status: 400 });

  const form = await request.formData();
  const file = form.get("file");
  const target = String(form.get("path") ?? "");
  if (!(file instanceof File)) return Response.json({ error: "No file." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "File is larger than 25 MB." }, { status: 413 });
  if (!/^[a-z0-9-]+\/[a-z0-9-]+\.[a-z0-9]+$/i.test(target)) return Response.json({ error: "Invalid path." }, { status: 400 });

  const destination = path.join(LOCAL_DATA_DIR, "uploads", ...target.split("/"));
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await file.arrayBuffer()));
  return Response.json({ publicUrl: `/uploads/${target}` });
}
