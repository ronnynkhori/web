import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { Role, UserDoc } from "@/lib/cms/types";
import { getStore, supabaseConfig } from "@/lib/store";
import { translator, type Translate } from "./i18n/translate";
import { can, type Area } from "./roles";
import { decodeSession, SESSION_COOKIE, verifyPassword, type Session } from "./session";

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await connection();
  const session = decodeSession(token);
  if (!session) return null;
  let users: UserDoc[];
  try {
    users = (await getStore().list<UserDoc>("users")) ?? [];
  } catch {
    // Fail closed: without the user list a deactivated account or a demoted role cannot be checked.
    return null;
  }
  // Re-check the account on every request so deactivation and role changes apply immediately.
  const user = users.find((u) => u.email === session.email);
  if (user) return user.active ? { ...session, name: user.name, role: user.role, sportIds: user.sportIds } : null;
  const bootstrapStillAllowed = !users.some((u) => u.role === "super" && u.active);
  return bootstrapStillAllowed && session.email === bootstrapCredentials()?.email ? session : null;
}

/** Use at the top of every admin page and server action. */
export async function requireUser(area: Area = "dashboard"): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!can(session.role, area)) redirect(`/admin?denied=${area}`);
  return session;
}

/** Bootstrap login used until the first super admin exists in the user list. */
function bootstrapCredentials(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) return { email: email.toLowerCase(), password };
  if (process.env.NODE_ENV !== "production") return { email: "admin@cplp2027.local", password: "cplp2027" };
  return null;
}

export function bootstrapHint(t: Translate = translator("en")): string | null {
  if (process.env.ADMIN_EMAIL) return null;
  return process.env.NODE_ENV !== "production"
    ? t("Development login: {email} / {password}", { email: "admin@cplp2027.local", password: "cplp2027" })
    : null;
}

async function supabasePasswordOk(email: string, password: string): Promise<boolean> {
  const config = supabaseConfig();
  if (!config) return false;
  const client = createClient(config.url, config.anonKey ?? config.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password });
  return !error;
}

export type LoginResult = { ok: true; session: Omit<Session, "exp"> } | { ok: false; error: string };

export async function authenticate(rawEmail: string, password: string): Promise<LoginResult> {
  const email = rawEmail.trim().toLowerCase();
  const store = getStore();
  let users: UserDoc[];
  try {
    users = (await store.list<UserDoc>("users")) ?? [];
  } catch {
    return { ok: false, error: "Sign-in is unavailable because the database cannot be reached. Try again shortly." };
  }
  const user = users.find((u) => u.email === email);

  if (user) {
    if (!user.active) return { ok: false, error: "This account has been deactivated." };
    const ok = store.kind === "supabase" ? await supabasePasswordOk(email, password) : await verifyPassword(password, user.passwordHash);
    if (!ok) return { ok: false, error: "Email or password is incorrect." };
    return { ok: true, session: { email, name: user.name, role: user.role, sportIds: user.sportIds } };
  }

  const hasSuper = users.some((u) => u.role === "super" && u.active);
  const boot = bootstrapCredentials();
  if (!hasSuper && boot && email === boot.email && password === boot.password) {
    const role: Role = "super";
    return { ok: true, session: { email, name: "Control Room admin", role, sportIds: [] } };
  }
  return { ok: false, error: "Email or password is incorrect." };
}
