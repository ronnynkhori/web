"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { StatusScreen } from "@/components/layout/status-screen";
import { Button } from "@/components/ui/button";
import { errorCopy, localeFromPath } from "@/lib/i18n/error-copy";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const locale = localeFromPath(usePathname());
  const t = errorCopy[locale];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen code="500" title={t.errorTitle} body={t.errorBody}>
      <Button type="button" variant="secondary" icon="arrow-right" onClick={() => retry()}>
        {t.retry}
      </Button>
      <Button href={`/${locale}`} variant="ghost">
        {t.home}
      </Button>
    </StatusScreen>
  );
}
