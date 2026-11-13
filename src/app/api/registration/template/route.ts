import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin/auth";
import { athleteTemplate } from "@/lib/registration/excel";
import { binaryResponse } from "@/lib/registration/respond";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "delegation" && session.role !== "registrar" && session.role !== "super")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const bytes = await athleteTemplate();
  return binaryResponse(bytes, {
    "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "content-disposition": 'attachment; filename="cplp-2027-athletes.xlsx"',
    "cache-control": "private, no-store",
    "x-robots-tag": "noindex",
  });
}
