import { revalidateTag } from "next/cache";
import { connection } from "next/server";
import { collections } from "@/lib/store/types";

/**
 * Vercel Cron safety net: refreshes all public content (scheduled and expiring
 * announcements, the banner, countries, fixtures...). Pages already refresh on
 * their own; this guarantees it even when nobody edits anything.
 */
export async function GET(request: Request) {
  await connection();
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  for (const tag of [...collections.filter((c) => c !== "users" && c !== "loginAttempts"), "live"]) revalidateTag(tag, "max");
  return Response.json({ ok: true, at: new Date().toISOString() });
}
