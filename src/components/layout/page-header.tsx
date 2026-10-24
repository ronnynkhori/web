import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ImageAsset } from "@/data/types";
import { Icon } from "@/components/ui/icon";
import { TorchStripe } from "@/components/ui/torch-stripe";
import { cn } from "@/lib/cn";

export interface Crumb {
  href: string;
  label: string;
}

/**
 * Dark title band for inner pages. Sits under the floating header, so it pads
 * by the header height. The last crumb is the current page and is not a link.
 */
export function PageHeader({
  id,
  overline,
  title,
  intro,
  crumbs,
  breadcrumbLabel,
  meta,
  image,
  imageAlt,
  titleSize = "l",
  children,
  className,
}: {
  id: string;
  overline: string;
  title: string;
  intro?: ReactNode;
  crumbs: Crumb[];
  breadcrumbLabel: string;
  meta?: ReactNode;
  /** Background photo behind a side scrim, so the band is not an empty black block. */
  image?: ImageAsset;
  imageAlt?: string;
  /** "m" for long titles such as announcements. */
  titleSize?: "l" | "m";
  /** Extra content beside the title on desktop (e.g. a photo). */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header data-theme="dark" data-surface="black" className={cn("relative isolate overflow-hidden bg-surface text-fg", className)}>
      {image && (
        <>
          <Image
            src={image.src}
            alt={imageAlt ?? ""}
            fill
            sizes="100vw"
            className="-z-20 object-cover object-[70%_50%]"
          />
          <span aria-hidden="true" className="absolute inset-0 -z-10 scrim-side" />
          <span aria-hidden="true" className="absolute inset-0 -z-10 scrim-hero opacity-60" />
        </>
      )}
      <TorchStripe variant="edge" className="right-0 -z-10" />
      <div className="container-page grid gap-6 pt-[calc(var(--header-h)+var(--tk-space-6))] pb-8 desktop:grid-cols-12 desktop:items-end">
        <div className={cn("flex flex-col gap-4", children ? "desktop:col-span-7" : "desktop:col-span-12")}>
          <nav aria-label={breadcrumbLabel}>
            <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 gap-y-1 p-0 type-caption text-fg-muted">
              {crumbs.map((c, i) => {
                const last = i === crumbs.length - 1;
                return (
                  <li key={c.href} className="flex items-center gap-2">
                    {last ? (
                      <span aria-current="page" className="text-fg-2">
                        {c.label}
                      </span>
                    ) : (
                      <>
                        <Link href={c.href} className="inline-flex min-h-touch items-center underline-offset-4 hover:text-fg hover:underline">
                          {c.label}
                        </Link>
                        <Icon name="chevron-right" size={16} />
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
          <p className="m-0 flex flex-wrap items-center gap-3 type-overline text-accent">
            <span>{overline}</span>
            {meta}
          </p>
          <h1 id={id} className={cn("m-0", titleSize === "m" ? "type-display-m" : "type-display-l")}>
            {title}
          </h1>
          {intro && <div className="max-w-prose type-body-l text-fg-2">{intro}</div>}
        </div>
        {children && <div className="desktop:col-span-5">{children}</div>}
      </div>
    </header>
  );
}
