import { getSession } from "@/lib/admin/auth";
import { loadItems } from "@/lib/admin/mutate";
import type { UserDoc } from "@/lib/cms/types";
import { getStore } from "@/lib/store";
import { collections } from "@/lib/store/types";

/** Full JSON backup of everything editable, for super admins. Password hashes are left out. */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "super") return Response.json({ error: "Not allowed." }, { status: 403 });

  const data: Record<string, unknown> = {};
  for (const collection of collections.filter((c) => c !== "loginAttempts")) {
    const items = await loadItems(collection);
    data[collection] =
      collection === "users" ? (items as UserDoc[]).map((u) => ({ ...u, passwordHash: undefined })) : items;
  }
  const audit = await getStore().listAudit(2000);
  const at = new Date().toISOString();
  return new Response(JSON.stringify({ exportedAt: at, exportedBy: session.email, collections: data, audit }, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="cplp2027-control-room-${at.slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
