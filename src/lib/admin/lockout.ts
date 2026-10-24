import "server-only";
import { createHash } from "node:crypto";
import { getStore } from "@/lib/store";
import type { StoredDoc } from "@/lib/store/types";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60_000;
const LOCK_MS = 15 * 60_000;

interface AttemptDoc extends StoredDoc {
  failures: number;
  firstAt: number;
  lockedUntil?: number;
}

/** Stored per account, so it holds across serverless instances. */
const attemptId = (email: string) => `la-${createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 32)}`;

/** Minutes left on a lock, or 0. Never blocks sign-in if the store cannot be read. */
export async function lockedMinutes(email: string): Promise<number> {
  try {
    const doc = await getStore().get<AttemptDoc>("loginAttempts", attemptId(email));
    const left = (doc?.lockedUntil ?? 0) - Date.now();
    return left > 0 ? Math.ceil(left / 60_000) : 0;
  } catch {
    return 0;
  }
}

/** Counts a failed sign-in; returns true when this failure locks the account. */
export async function recordFailure(email: string): Promise<boolean> {
  const store = getStore();
  if (!store.writable) return false;
  try {
    const id = attemptId(email);
    const now = Date.now();
    const prev = await store.get<AttemptDoc>("loginAttempts", id);
    const fresh = !prev || now - prev.firstAt > WINDOW_MS;
    const failures = fresh ? 1 : prev.failures + 1;
    const locked = failures >= MAX_FAILURES;
    const doc: AttemptDoc = {
      id,
      failures: locked ? 0 : failures,
      firstAt: fresh || locked ? now : prev.firstAt,
      lockedUntil: locked ? now + LOCK_MS : undefined,
    };
    await store.put("loginAttempts", doc, "system");
    if (locked) {
      await store.audit({ actor: email.trim().toLowerCase(), role: "-", action: "sign-in locked", summary: `${MAX_FAILURES} failed attempts; locked for ${LOCK_MS / 60_000} minutes` });
    }
    return locked;
  } catch {
    return false;
  }
}

export async function clearFailures(email: string): Promise<void> {
  const store = getStore();
  if (!store.writable) return;
  try {
    await store.remove("loginAttempts", attemptId(email));
  } catch {
    // Not critical: the window expires on its own.
  }
}
