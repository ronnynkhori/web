"use client";

import { usePathname } from "next/navigation";
import { StatusScreen } from "@/components/layout/status-screen";
import { MascotActor } from "@/components/mascot/mascot-actor";
import { Button } from "@/components/ui/button";
import { mascotPoses } from "@/data/mascot";
import { errorCopy, localeFromPath } from "@/lib/i18n/error-copy";

export default function NotFound() {
  const locale = localeFromPath(usePathname());
  const t = errorCopy[locale];
  return (
    <StatusScreen
      code="404"
      title={t.notFoundTitle}
      body={t.notFoundBody}
      aside={
        <div aria-hidden="true" className="relative mx-auto shrink-0 tablet:mx-0">
          <span className="hero-ground absolute inset-x-[12%] bottom-0 h-[8%] rounded-pill" />
          <MascotActor
            {...mascotPoses.thumbsUp}
            sizes="(min-width: 40rem) 18rem, 10rem"
            loading="eager"
            className="h-[10rem] tablet:h-[min(22rem,48svh)]"
            imgClassName="h-full w-auto"
          />
        </div>
      }
    >
      <Button href={`/${locale}`} variant="secondary" icon="arrow-right">
        {t.home}
      </Button>
    </StatusScreen>
  );
}
