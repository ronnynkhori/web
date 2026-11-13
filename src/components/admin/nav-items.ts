import type { IconName } from "@/components/ui/icon";
import type { Role } from "@/lib/cms/types";
import type { Area } from "@/lib/admin/roles";

export interface AdminNavItem {
  href: string;
  label: string;
  /** Shorter label for the phone tab bar. */
  short?: string;
  icon: IconName;
  area: Area;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavGroup[] = [
  {
    label: "Registration",
    items: [
      { href: "/admin", label: "Dashboard", short: "Home", icon: "grid", area: "dashboard" },
      { href: "/admin/registrations", label: "Registrations", short: "Entries", icon: "list", area: "registrations" },
      { href: "/admin/registration-rules", label: "Quotas and documents", short: "Rules", icon: "check", area: "registrations" },
    ],
  },
  {
    label: "Accounts",
    items: [
      { href: "/admin/users", label: "Users", icon: "id", area: "users" },
      { href: "/admin/activity", label: "Activity log", short: "Activity", icon: "clock", area: "activity" },
    ],
  },
];

/** The screens each role uses. Games and content tools are not part of this menu. */
const phoneTabs: Record<Role, string[]> = {
  super: ["/admin", "/admin/registrations", "/admin/users"],
  registrar: ["/admin", "/admin/registrations"],
  delegation: ["/admin"],
  results: ["/admin"],
  scorer: ["/admin"],
  editor: ["/admin"],
  media: ["/admin"],
};

export function phoneTabsFor(role: Role): AdminNavItem[] {
  const all = adminNav.flatMap((g) => g.items);
  return phoneTabs[role].map((href) => all.find((i) => i.href === href)).filter((i): i is AdminNavItem => Boolean(i));
}

export function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}
