"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions/auth";
import { Icon } from "@/components/ui/icon";
import { inputClass } from "./portal/fields";

export function DelegationLoginForm({ locale, email, password, enter }: { locale: string; email: string; password: string; enter: string }) {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={`/${locale}/delegation`} />
      <label className="flex flex-col gap-1.5">
        <span className="type-body-s font-semibold">{email}</span>
        <span className="relative">
          <Icon name="mail" size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-muted" />
          <input name="email" type="email" autoComplete="username" required className={`${inputClass} pl-[2.25rem]`} />
        </span>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="type-body-s font-semibold">{password}</span>
        <span className="relative">
          <Icon name="shield" size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-muted" />
          <input name="password" type="password" autoComplete="current-password" required className={`${inputClass} pl-[2.25rem]`} />
        </span>
      </label>
      {state.error && (
        <p role="alert" className="m-0 flex items-center gap-2 rounded-sm bg-error/10 px-3 py-2 type-body-s font-semibold text-fg">
          <Icon name="alert" size={16} className="text-accent" /> {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="hover-overlay press mt-1 inline-flex min-h-touch-lg items-center justify-center gap-2 rounded-xs bg-action-primary px-5 type-label text-on-action-primary inset-ring-2 inset-ring-action-primary-edge disabled:opacity-50"
      >
        {enter} <Icon name="arrow-right" size={16} className="nudge" />
      </button>
    </form>
  );
}
