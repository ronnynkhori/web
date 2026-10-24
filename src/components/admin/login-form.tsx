"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { login } from "@/app/admin/actions/auth";
import { useT } from "./i18n";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  const t = useT();
  return (
    <form action={action} className="flex flex-col gap-5">
      <Field className="gap-2">
        <FieldLabel htmlFor="login-email" className="font-semibold">
          {t("Email")}
        </FieldLabel>
        <Input id="login-email" name="email" type="email" inputMode="email" autoComplete="username" required />
      </Field>
      <Field className="gap-2">
        <FieldLabel htmlFor="login-password" className="font-semibold">
          {t("Password")}
        </FieldLabel>
        <Input id="login-password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {state.error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
        {pending ? t("Signing in…") : t("Sign in")}
      </Button>
      <Link href="/admin/forgot" className="self-center text-sm font-semibold text-primary underline-offset-4 hover:underline">
        {t("Forgot your password?")}
      </Link>
    </form>
  );
}
