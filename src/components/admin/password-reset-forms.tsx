"use client";

import { useActionState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, KeyRound, Loader2, MailCheck, Send } from "lucide-react";
import { requestPasswordReset, resetPassword } from "@/app/admin/actions/auth";
import { useT } from "./i18n";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

function BackToSignIn() {
  const t = useT();
  return (
    <Link href="/admin/login" className="inline-flex items-center gap-1.5 self-center text-sm font-semibold text-primary underline-offset-4 hover:underline">
      <ArrowLeft className="size-4" aria-hidden="true" />
      {t("Back to sign in")}
    </Link>
  );
}

function ErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive" role="alert">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function ForgotForm({ available }: { available: boolean }) {
  const [state, action, pending] = useActionState(requestPasswordReset, {});
  const t = useT();

  if (!available) {
    return (
      <>
        <Alert>
          <AlertCircle />
          <AlertTitle>{t("Email reset works on the live site only")}</AlertTitle>
          <AlertDescription>{t("This copy saves to this computer and cannot send email. A Super admin can set a new password under Users.")}</AlertDescription>
        </Alert>
        <BackToSignIn />
      </>
    );
  }

  if (state.sent) {
    return (
      <>
        <Alert className="bg-success text-success-foreground" role="status">
          <MailCheck />
          <AlertTitle>{t("Check your email")}</AlertTitle>
          <AlertDescription className="text-success-foreground">
            {t(
              "If that address has a Control Room account, a reset link is on its way. It can take a few minutes, so check your spam folder too. The link works once and expires soon, so use it right away.",
            )}
          </AlertDescription>
        </Alert>
        <BackToSignIn />
      </>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <Field className="gap-2">
        <FieldLabel htmlFor="forgot-email" className="font-semibold">
          {t("Email")}
        </FieldLabel>
        <Input id="forgot-email" name="email" type="email" inputMode="email" autoComplete="username" required />
        <FieldDescription>{t("The email you use to sign in to the Control Room.")}</FieldDescription>
      </Field>
      {state.error && <ErrorAlert message={state.error} />}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? <Loader2 className="animate-spin" /> : <Send />}
        {pending ? t("Sending…") : t("Send reset link")}
      </Button>
      <BackToSignIn />
    </form>
  );
}

const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};

/** Supabase puts the one-time recovery token (or the reason it failed) in the URL fragment. */
function useRecoveryLink() {
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => null,
  );
  if (hash === null) return { status: "checking" as const };
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const token = params.get("access_token");
  if (token && params.get("type") === "recovery") return { status: "ready" as const, token };
  if (params.get("error")) return { status: "expired" as const };
  return { status: "missing" as const };
}

export function ResetForm() {
  const link = useRecoveryLink();
  const [state, action, pending] = useActionState(resetPassword, {});
  const t = useT();

  if (link.status === "checking") {
    return (
      <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        {t("Checking your link…")}
      </p>
    );
  }

  if (link.status !== "ready") {
    return (
      <>
        <ErrorAlert
          message={
            link.status === "expired"
              ? t("This reset link has expired or was already used.")
              : t("Open this page from the link in your password reset email.")
          }
        />
        <Button asChild size="lg" className="w-full">
          <Link href="/admin/forgot">
            <Send />
            {t("Send a new reset link")}
          </Link>
        </Button>
        <BackToSignIn />
      </>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={link.token} />
      <Field className="gap-2">
        <FieldLabel htmlFor="reset-password" className="font-semibold">
          {t("New password")}
        </FieldLabel>
        <Input id="reset-password" name="password" type="password" autoComplete="new-password" minLength={10} required />
        <FieldDescription>{t("At least 10 characters.")}</FieldDescription>
      </Field>
      <Field className="gap-2">
        <FieldLabel htmlFor="reset-confirm" className="font-semibold">
          {t("Type it again")}
        </FieldLabel>
        <Input id="reset-confirm" name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      </Field>
      {state.error && <ErrorAlert message={state.error} />}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? <Loader2 className="animate-spin" /> : <KeyRound />}
        {pending ? t("Saving…") : t("Save new password")}
      </Button>
    </form>
  );
}
