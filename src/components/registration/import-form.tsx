"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { importAthletes, type FormState } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";

export function ImportForm({ locale }: { locale: Locale }) {
  const copy = regCopy(locale);
  const [state, action, pending] = useActionState(importAthletes, { errors: [], message: "" } satisfies FormState);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="locale" value={locale} />
      <p className="m-0 type-body-s text-fg-muted">{copy.importHelp}</p>
      {/* The template is a file download, so this stays a normal link. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/api/registration/template" className="type-label text-link">
        {copy.downloadTemplate}
      </a>
      <input name="workbook" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required />
      {state.message && <p className="m-0 type-body-s">{state.message}</p>}
      {state.errors.map((error) => (
        <p key={error} className="m-0 type-body-s text-accent">
          {error}
        </p>
      ))}
      <Button type="submit" variant="ghost" disabled={pending} className="self-start">
        {copy.import}
      </Button>
    </form>
  );
}
