import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin/auth";
import { loadParticipants } from "@/lib/registration/data";
import { participantsWorkbook } from "@/lib/registration/excel";
import { binaryResponse } from "@/lib/registration/respond";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });
  let people = await loadParticipants();
  if (session.role === "delegation") {
    if (!session.countryCode) return new NextResponse("Forbidden", { status: 403 });
    people = people.filter((person) => person.countryCode === session.countryCode);
  } else if (session.role === "registrar" || session.role === "super") {
    const country = new URL(request.url).searchParams.get("country");
    if (country) people = people.filter((person) => person.countryCode === country);
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
  const bytes = await participantsWorkbook(people);
  return binaryResponse(bytes, {
    "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "content-disposition": 'attachment; filename="cplp-2027-registration.xlsx"',
    "cache-control": "private, no-store",
    "x-robots-tag": "noindex",
  });
}
