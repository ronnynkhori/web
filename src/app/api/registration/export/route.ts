import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin/auth";
import { loadParticipants } from "@/lib/registration/data";
import { participantsWorkbook } from "@/lib/registration/excel";
import { applyFilter, readFilter } from "@/lib/registration/filter";
import { binaryResponse } from "@/lib/registration/respond";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  let people = await loadParticipants();
  const params = new URL(request.url).searchParams;
  let name = "cplp-2027-inscricoes";
  if (session.role === "delegation") {
    if (!session.countryCode) return new NextResponse("Forbidden", { status: 403 });
    people = people.filter((person) => person.countryCode === session.countryCode);
    name += `-${session.countryCode}`;
  } else if (session.role === "registrar" || session.role === "super") {
    const filter = readFilter((key) => params.get(key));
    people = applyFilter(people, filter);
    if (filter.country) name += `-${filter.country}`;
    if (filter.status) name += `-${filter.status}`;
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const bytes = await participantsWorkbook(people);
  return binaryResponse(bytes, {
    "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "content-disposition": `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    "cache-control": "private, no-store",
    "x-robots-tag": "noindex",
  });
}
