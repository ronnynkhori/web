"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, TriangleAlert } from "lucide-react";
import { useT } from "@/components/admin/i18n";
import { Button } from "@/components/admin/ui/button";

/** Keeps the sidebar and top bar in place so staff can retry or move on. */
export default function ConsoleError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border bg-card px-6 py-10 text-center shadow-xs">
      <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-display text-3xl leading-none tracking-wide uppercase">{t("This page did not load")}</h1>
        <p className="m-0 text-sm text-muted-foreground">
          {t("Anything you already saved is safe. Try again, or go back to the dashboard.")}
        </p>
        {error.digest && <p className="m-0 text-xs text-muted-foreground">{t("Reference: {code}", { code: error.digest })}</p>}
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button type="button" onClick={() => retry()}>
          <RotateCw /> {t("Try again")}
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">{t("Back to the dashboard")}</Link>
        </Button>
      </div>
    </div>
  );
}
