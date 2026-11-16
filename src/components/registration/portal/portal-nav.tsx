"use client";

import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

export interface PortalLink {
  href: string;
  label: string;
  icon: IconName;
  /** Exact match only (the dashboard). */
  exact?: boolean;
  /** Also active for these path prefixes. */
  also?: string[];
}

/** Tabs under the delegation banner. Scrolls sideways on phones. */
export function PortalNav({ links, label }: { links: PortalLink[]; label: string }) {
  const pathname = usePathname();
  const isActive = (link: PortalLink) =>
    link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`) || (link.also ?? []).some((p) => pathname.startsWith(p));
  return (
    <nav aria-label={label} className="-mb-px overflow-x-auto">
      <ul className="m-0 flex w-max list-none gap-1 p-0">
        {links.map((link) => {
          const active = isActive(link);
          return (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-touch items-center gap-2 border-b-[3px] px-3 type-label whitespace-nowrap transition-colors duration-ui",
                  active ? "border-action-secondary text-fg" : "border-transparent text-fg-2 hover:text-fg",
                )}
              >
                <Icon name={link.icon} size={16} />
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
