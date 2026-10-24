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
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", short: "Home", icon: "grid", area: "dashboard" }],
  },
  {
    label: "Live Games",
    items: [
      { href: "/admin/scores", label: "Score desk", short: "Scores", icon: "live", area: "scores" },
      { href: "/admin/results", label: "Event results", short: "Results", icon: "list", area: "results" },
      { href: "/admin/approvals", label: "Approvals", icon: "check", area: "approvals" },
      { href: "/admin/medals", label: "Medal table", short: "Medals", icon: "trophy", area: "medals" },
      { href: "/admin/c/schedule", label: "Schedule", icon: "calendar", area: "schedule" },
      { href: "/admin/c/countries", label: "Countries", icon: "globe", area: "countries" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/c/announcements", label: "Announcements", short: "Notices", icon: "megaphone", area: "announcements" },
      { href: "/admin/c/documents", label: "Documents", icon: "download", area: "documents" },
      { href: "/admin/c/guide", label: "Games guide", short: "Guide", icon: "info", area: "guide" },
      { href: "/admin/c/faq", label: "FAQ & chatbot", short: "FAQ", icon: "chat", area: "faq" },
      { href: "/admin/c/venues", label: "Venues", icon: "pin", area: "venues" },
      { href: "/admin/c/sponsors", label: "Sponsors", icon: "star", area: "sponsors" },
    ],
  },
  {
    label: "Media",
    items: [
      { href: "/admin/c/media", label: "Gallery photos", short: "Photos", icon: "camera", area: "media" },
      { href: "/admin/c/photoLinks", label: "Photo downloads", short: "Downloads", icon: "image", area: "photoLinks" },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/admin/settings", label: "Site settings", short: "Settings", icon: "globe", area: "settings" },
      { href: "/admin/users", label: "Users", icon: "id", area: "users" },
      { href: "/admin/activity", label: "Activity log", short: "Activity", icon: "clock", area: "activity" },
    ],
  },
];

/** The three areas each role uses most during the Games; everything else sits behind "More". */
const phoneTabs: Record<Role, string[]> = {
  super: ["/admin", "/admin/scores", "/admin/approvals"],
  results: ["/admin", "/admin/scores", "/admin/approvals"],
  scorer: ["/admin", "/admin/scores", "/admin/results"],
  editor: ["/admin", "/admin/c/announcements", "/admin/settings"],
  media: ["/admin", "/admin/c/media", "/admin/c/photoLinks"],
};

export function phoneTabsFor(role: Role): AdminNavItem[] {
  const all = adminNav.flatMap((g) => g.items);
  return phoneTabs[role].map((href) => all.find((i) => i.href === href)).filter((i): i is AdminNavItem => Boolean(i));
}

export function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}
