"use client";

import { prepareUpload } from "@/app/admin/actions/content";
import { translator, type Translate } from "@/lib/admin/i18n/translate";

const english = translator("en");

const MAX_EDGE = 2400;
const MAX_BYTES = 25 * 1024 * 1024;

export interface PreparedImage {
  file: File;
  width: number;
  height: number;
}

function svgSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth || 400, height: img.naturalHeight || 200 });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve({ width: 400, height: 200 });
    img.src = url;
  });
}

/** Resizes large photos to 2400 px on the long edge and re-encodes them, before upload. */
export async function prepareImage(file: File, t: Translate = english): Promise<PreparedImage> {
  if (file.type === "image/svg+xml") return { file, ...(await svgSize(file)) };
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  if (scale === 1 && file.size < 1_500_000) {
    bitmap.close();
    return { file, width, height };
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const png = file.type === "image/png";
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error(t("Could not process the image.")))), png ? "image/png" : "image/jpeg", 0.86),
  );
  const name = file.name.replace(/\.[^.]+$/, png ? ".png" : ".jpg");
  return { file: new File([blob], name, { type: blob.type }), width, height };
}

/** Uploads straight to storage (signed Supabase URL) or the local dev endpoint. Returns the public URL. */
export async function uploadFile(file: File, folder: string, t: Translate = english): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_BYTES) return { error: t("Files must be under 25 MB.") };
  const target = await prepareUpload(folder, file.name, file.type, file.size);
  if ("error" in target) return { error: t(target.error) };

  const body = new FormData();
  let response: Response;
  try {
    if (target.kind === "signed") {
      body.append("cacheControl", "31536000");
      body.append("", file);
      response = await fetch(target.uploadUrl, { method: "PUT", body, headers: { "x-upsert": "true" } });
    } else {
      body.append("file", file);
      body.append("path", target.path);
      response = await fetch(target.endpoint, { method: "POST", body });
    }
  } catch {
    return { error: t("Upload failed. Check your connection and try again.") };
  }
  if (!response.ok) return { error: t("Upload failed ({status}).", { status: response.status }) };
  return { url: target.publicUrl };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
