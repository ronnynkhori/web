import { createHash } from "node:crypto";
import { connection } from "next/server";
import { getResultsProvider } from "@/lib/live/provider";
import type { LiveSnapshot } from "@/lib/live/types";

/** Short CDN window: writes clear the server cache at once, so this bounds what visitors wait for. */
const CACHE = "public, max-age=0, s-maxage=5, stale-while-revalidate=5";

export async function GET(request: Request) {
  await connection();
  try {
    const snapshot = await getResultsProvider().getSnapshot();
    // Result notes are only shown in the Control Room.
    const body = JSON.stringify({ ...snapshot, results: snapshot.results.map((r) => ({ ...r, notes: null })) });
    const etag = `"${createHash("sha1").update(body).digest("base64url")}"`;
    if (request.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag, "Cache-Control": CACHE } });
    }
    return new Response(body, { headers: { "Content-Type": "application/json", ETag: etag, "Cache-Control": CACHE } });
  } catch {
    const failed: Pick<LiveSnapshot, "status" | "updatedAt"> = { status: "error", updatedAt: null };
    return Response.json(failed, { status: 503 });
  }
}
