import { io } from "next/cache";
import { getSettings } from "@/lib/cms/read";
import { getPhase, isPhase, type Phase } from "@/lib/phase";

/**
 * Phase at request time: a ?phase= preview link, else the Control Room
 * override, else the calendar. Reads the clock, so render it inside Suspense.
 */
export async function currentPhase(requested?: string | string[]): Promise<Phase> {
  const settings = await getSettings();
  await io();
  if (isPhase(requested)) return requested;
  return settings.phase === "auto" ? getPhase(new Date()) : settings.phase;
}
