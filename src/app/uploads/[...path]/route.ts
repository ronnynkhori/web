import { readFile } from "node:fs/promises";
import path from "node:path";
import { LOCAL_DATA_DIR } from "@/lib/store/local-store";

const types: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

/** Serves files uploaded in local development (production files live in Supabase Storage). */
export async function GET(_request: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const parts = (await params).path;
  if (parts.some((p) => !/^[a-z0-9.-]+$/i.test(p) || p.startsWith("."))) return new Response("Not found", { status: 404 });
  const ext = parts.at(-1)?.split(".").pop()?.toLowerCase() ?? "";
  try {
    const data = await readFile(path.join(LOCAL_DATA_DIR, "uploads", ...parts));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": types[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        ...(ext === "svg" ? { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
