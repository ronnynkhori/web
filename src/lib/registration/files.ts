import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/store";
import type { FileKind } from "./model";

const root = path.join(process.cwd(), ".data", "registration");
const bucket = "registration-files";

const allowed = new Map<string, string>([
  ["application/pdf", "pdf"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
]);

export const maxFileBytes = 8 * 1024 * 1024;

export function fileExtension(type: string, filename: string): string | null {
  const fromType = allowed.get(type);
  if (fromType) return fromType;
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || ext === "jpg" || ext === "jpeg" || ext === "png") return ext === "jpeg" ? "jpg" : ext;
  return null;
}

function storage() {
  const config = supabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } }).storage.from(bucket);
}

export async function writePrivateFile(id: string, bytes: Buffer, contentType = "application/octet-stream"): Promise<void> {
  const remote = storage();
  if (remote) {
    const { error } = await remote.upload(id, bytes, { contentType, upsert: true });
    if (error) throw new Error(error.message);
    return;
  }
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, id), bytes);
}

export async function readPrivateFile(id: string): Promise<Buffer> {
  const remote = storage();
  if (remote) {
    const { data, error } = await remote.download(id);
    if (error || !data) throw new Error(error?.message ?? "Missing file");
    return Buffer.from(await data.arrayBuffer());
  }
  return readFile(path.join(root, id));
}

export function acceptUpload(file: File, kind: FileKind): { ok: true; bytes: Promise<Buffer> } | { ok: false; reason: "empty" | "type" | "size" } {
  if (file.size === 0) return { ok: false, reason: "empty" };
  if (file.size > maxFileBytes) return { ok: false, reason: "size" };
  if (!fileExtension(file.type, file.name)) return { ok: false, reason: "type" };
  void kind;
  return {
    ok: true,
    bytes: file.arrayBuffer().then((buf) => Buffer.from(buf)),
  };
}
