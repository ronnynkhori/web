"use client";

import { usePathname } from "next/navigation";
import { StatusScreen } from "@/components/layout/status-screen";
import { Button } from "@/components/ui/button";
import { errorCopy, localeFromPath } from "@/lib/i18n/error-copy";

export default function NotFound() {
  const locale = localeFromPath(usePathname());
  const t = errorCopy[locale];
  return (
    <StatusScreen code="404" title={t.notFoundTitle} body={t.notFoundBody}>
      <Button href={`/${locale}`} variant="secondary" icon="arrow-right">
        {t.home}
      </Button>
    </StatusScreen>
  );
}
