import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";

export function PageTitle({ back, title, meta, actions }: { back?: { href: string; label: string }; title: string; meta?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-3 tablet:flex-row tablet:items-end tablet:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        {back && (
          <a href={back.href} className="inline-flex items-center gap-1 self-start type-label text-link">
            <Icon name="arrow-left" size={16} /> {back.label}
          </a>
        )}
        <h1 className="m-0 type-heading-xl break-words">{title}</h1>
        {meta && <div className="flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
