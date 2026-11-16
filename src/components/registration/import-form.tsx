"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/lib/i18n/config";
import { importAthletes, type FormState } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { portalCopy } from "@/lib/registration/portal-copy";

export function ImportForm({ locale }: { locale: Locale }) {
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  const [state, action, pending] = useActionState(importAthletes, { errors: [], message: "" } satisfies FormState);
  const [file, setFile] = useState("");
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <p className="m-0 type-body-s text-fg-muted">{copy.importHelp}</p>
      {/* The template is a file download, so this stays a normal link. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/api/registration/template" className="inline-flex items-center gap-2 self-start type-label text-link">
        <Icon name="download" size={16} /> {copy.downloadTemplate}
      </a>
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed border-line-strong bg-surface-2 px-4 py-5 text-center transition-colors duration-ui hover:border-fg-muted focus-within:border-focus">
        <Icon name="list" size={24} className="text-fg-muted" />
        <span className="type-body-s font-semibold text-fg">{file || p.importDrop}</span>
        <span className="type-caption text-link">{file ? p.replace : p.choose}</span>
        <input
          name="workbook"
          type="file"
          required
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={(event) => setFile(event.currentTarget.files?.[0]?.name ?? "")}
          className="sr-only"
        />
      </label>
      {state.message && (
        <p role="status" className="m-0 flex items-center gap-2 rounded-sm bg-success px-3 py-2 type-body-s font-semibold text-on-success">
          <Icon name="check" size={16} /> {state.message}
        </p>
      )}
      {state.errors.length > 0 && (
        <ul role="alert" className="m-0 flex max-h-48 list-none flex-col gap-1 overflow-auto rounded-sm bg-error/10 p-3 type-caption text-fg">
          {state.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <Button type="submit" variant="ghost" disabled={pending || !file} loading={pending} className="self-start">
        {copy.import}
      </Button>
    </form>
  );
}
