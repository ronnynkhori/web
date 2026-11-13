"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions/auth";
import { Button } from "@/components/ui/button";

export function DelegationLoginForm({ locale, email, password, enter }: { locale: string; email: string; password: string; enter: string }) {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="flex max-w-sm flex-col gap-4">
      <input type="hidden" name="next" value={`/${locale}/delegation`} />
      <label className="flex flex-col gap-1 type-label">
        {email}
        <input name="email" type="email" autoComplete="username" required className="min-h-touch rounded-sm border border-line bg-surface px-3 type-body text-fg" />
      </label>
      <label className="flex flex-col gap-1 type-label">
        {password}
        <input name="password" type="password" autoComplete="current-password" required className="min-h-touch rounded-sm border border-line bg-surface px-3 type-body text-fg" />
      </label>
      {state.error && <p className="m-0 type-body-s text-accent">{state.error}</p>}
      <Button type="submit" variant="secondary" disabled={pending}>
        {enter}
      </Button>
    </form>
  );
}
