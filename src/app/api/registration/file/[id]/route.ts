import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin/auth";
import { loadFiles } from "@/lib/registration/data";
import { readPrivateFile } from "@/lib/registration/files";
import { binaryResponse } from "@/lib/registration/respond";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  const { id } = await context.params;
  if (!/^file-[a-z0-9]+$/i.test(id)) return new NextResponse("Not found", { status: 404 });
  const file = (await loadFiles()).find((item) => item.id === id);
  if (!file) return new NextResponse("Not found", { status: 404 });
  const staff = session.role === "super" || session.role === "registrar";
  const own = session.role === "delegation" && session.countryCode === file.countryCode;
  if (!staff && !own) return new NextResponse("Forbidden", { status: 403 });
  try {
    const bytes = await readPrivateFile(file.id);
    const filename = file.filename.replace(/["\r\n]/g, "");
    return binaryResponse(bytes, {
      "content-type": file.contentType || "application/octet-stream",
      "content-disposition": `inline; filename="${filename}"`,
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
