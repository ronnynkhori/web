"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { authenticate, getSession } from "@/lib/admin/auth";
import { getT } from "@/lib/admin/i18n/server";
import { clearFailures, lockedMinutes, recordFailure } from "@/lib/admin/lockout";
import { audit } from "@/lib/admin/mutate";
import { completeReset, MIN_PASSWORD, sendResetEmail } from "@/lib/admin/recovery";
import { encodeSession, SESSION_COOKIE, SESSION_HOURS } from "@/lib/admin/session";
import { siteUrl } from "@/lib/site";
import { getStore } from "@/lib/store";

export async function login(_prev: { error?: string }, form: FormData): Promise<{ error?: string }> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const t = await getT();
  if (!email || !password) return { error: t("Enter your email and password.") };

  const forgot = t("If you have forgotten your password, use “Forgot your password?” below to reset it.");
  const wait = await lockedMinutes(email);
  if (wait) {
    const tryAgain = wait === 1 ? t("Too many failed attempts. Try again in 1 minute.") : t("Too many failed attempts. Try again in {n} minutes.", { n: wait });
    return { error: `${tryAgain} ${forgot}` };
  }

  const result = await authenticate(email, password);
  if (!result.ok) {
    if (await recordFailure(email)) return { error: `${t("Too many failed attempts. Try again in {n} minutes.", { n: 15 })} ${forgot}` };
    return { error: t(result.error) };
  }
  await clearFailures(email);

  (await cookies()).set(SESSION_COOKIE, encodeSession(result.session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  try {
    await audit({ ...result.session, exp: 0 }, "signed in");
  } catch {
    // Signing in must still work if the audit log is unavailable (read-only preview).
  }
  redirect("/admin");
}

export async function requestPasswordReset(_prev: { error?: string; sent?: boolean }, form: FormData): Promise<{ error?: string; sent?: boolean }> {
  const email = String(form.get("email") ?? "").trim();
  const t = await getT();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: t("Enter the email you use to sign in.") };
  const origin = (await headers()).get("origin") ?? siteUrl();
  const result = await sendResetEmail(email, `${origin}/admin/reset`);
  return result.ok ? { sent: true } : { error: t(result.error) };
}

export async function resetPassword(_prev: { error?: string }, form: FormData): Promise<{ error?: string }> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const t = await getT();
  if (password.length < MIN_PASSWORD) return { error: t("Use at least {n} characters.", { n: MIN_PASSWORD }) };
  if (password !== confirm) return { error: t("The two passwords do not match.") };
  const result = await completeReset(token, password);
  if (!result.ok) return { error: t(result.error) };
  try {
    await getStore().audit({ actor: result.email, role: "-", action: "reset own password", summary: "Password changed with an email reset link" });
  } catch {
    // The password is already changed; a missing log entry must not hide that.
  }
  redirect("/admin/login?reset=1");
}

export async function logout(): Promise<void> {
  const session = await getSession();
  (await cookies()).delete(SESSION_COOKIE);
  if (session) {
    try {
      await audit(session, "signed out");
    } catch {
      // ignore
    }
  }
  redirect("/admin/login");
}
