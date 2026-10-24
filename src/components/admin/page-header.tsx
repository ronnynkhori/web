import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, Plus } from "lucide-react";
import type { IconName } from "@/components/ui/icon";
import { AdminIcon } from "./admin-icon";
import { Button } from "./ui/button";

export interface PrimaryAction {
  href: string;
  label: string;
}

/**
 * Page title block. The main "Add …" action sits top-right on desktop and
 * becomes a full-width button pinned above the tab bar on phones, where the
 * thumb is.
 */
export function PageHeader({
  title,
  description,
  icon,
  back,
  actions,
  primary,
  meta,
}: {
  title: string;
  description?: ReactNode;
  icon?: IconName;
  back?: { href: string; label: string };
  actions?: ReactNode;
  primary?: PrimaryAction;
  meta?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        {back && (
          <Link
            href={back.href}
            className="-ml-1 inline-flex h-8 items-center gap-1 self-start rounded-md pr-2 text-sm font-medium text-primary hover:underline"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            {back.label}
          </Link>
        )}
        <div className="flex items-center gap-3">
          {icon && (
            <span className="hidden size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground sm:grid">
              <AdminIcon name={icon} className="size-5" />
            </span>
          )}
          <h1 className="font-display text-[2rem] leading-none tracking-wide break-words md:text-[2.5rem]">{title}</h1>
        </div>
        {meta && <div className="flex flex-wrap items-center gap-2">{meta}</div>}
        {description && <p className="max-w-[70ch] text-sm text-muted-foreground md:text-[0.9375rem]">{description}</p>}
      </div>
      {(actions || primary) && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {primary && (
            <Button asChild className="hidden md:inline-flex">
              <Link href={primary.href}>
                <Plus /> {primary.label}
              </Link>
            </Button>
          )}
        </div>
      )}
      {primary && (
        <div className="fixed inset-x-0 bottom-[var(--tabbar-h)] z-30 border-t bg-background/95 p-3 backdrop-blur md:hidden">
          <Button asChild size="lg" className="w-full">
            <Link href={primary.href}>
              <Plus /> {primary.label}
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}

/** Reserves room at the end of a page for a bar pinned above the phone tab bar. */
export function MobileBarSpacer() {
  return <div aria-hidden="true" className="h-20 md:hidden" />;
}
