import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { UserDoc } from "@/lib/cms/types";
import { getStore, supabaseConfig } from "@/lib/store";
import { clearFailures } from "./lockout";

export const MIN_PASSWORD = 10;

/** Self-service reset needs Supabase Auth to send the email; local mode has no mail sender. */
export function selfResetAvailable(): boolean {
  return getStore().kind === "supabase" && supabaseConfig() !== null;
}

function authClient(key: "anon" | "service") {
  const config = supabaseConfig();
  if (!config) return null;
  const apiKey = key === "anon" ? (config.anonKey ?? config.serviceKey) : config.serviceKey;
  return createClient(config.url, apiKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function activeUser(email: string): Promise<UserDoc | undefined> {
  const users = (await getStore().list<UserDoc>("users")) ?? [];
  return users.find((u) => u.email.toLowerCase() === email && u.active);
}

export type ResetRequest = { ok: true } | { ok: false; error: string };

/**
 * Sends the Supabase recovery email. Unknown or deactivated accounts get the same
 * answer as real ones, so the form cannot be used to discover who has an account.
 */
export async function sendResetEmail(rawEmail: string, redirectTo: string): Promise<ResetRequest> {
  const email = rawEmail.trim().toLowerCase();
  const client = authClient("anon");
  if (!client || !selfResetAvailable()) return { ok: false, error: "Password reset by email is not available here." };
  if (!(await activeUser(email))) return { ok: true };
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
  if (error && (error.status === 429 || /rate limit/i.test(error.message))) {
    return { ok: false, error: "Too many reset emails were sent. Wait a few minutes and try again." };
  }
  return { ok: true };
}

export type ResetResult = { ok: true; email: string } | { ok: false; error: string };

/** Sets the new password for the account the recovery link was issued to. */
export async function completeReset(accessToken: string, password: string): Promise<ResetResult> {
  const client = authClient("service");
  if (!client || !selfResetAvailable()) return { ok: false, error: "Password reset by email is not available here." };
  const expired = "This reset link has expired or was already used. Ask for a new one.";
  if (!accessToken) return { ok: false, error: expired };

  const { data, error } = await client.auth.getUser(accessToken);
  const email = data.user?.email?.toLowerCase();
  if (error || !data.user || !email) return { ok: false, error: expired };
  if (!(await activeUser(email))) return { ok: false, error: "This account has been deactivated." };

  const { error: updateError } = await client.auth.admin.updateUserById(data.user.id, { password });
  if (updateError) return { ok: false, error: "The password could not be changed. Try again or ask for a new link." };
  await clearFailures(email);
  // Ends the one-time recovery session so the link cannot be reused.
  await client.auth.admin.signOut(accessToken).catch(() => undefined);
  return { ok: true, email };
}
