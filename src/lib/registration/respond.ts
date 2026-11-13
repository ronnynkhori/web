import { NextResponse } from "next/server";

/** Node's Buffer and the DOM BodyInit types disagree, so the body is passed through. */
export function binaryResponse(body: Buffer, headers: Record<string, string>) {
  return new NextResponse(body as unknown as BodyInit, { headers });
}
