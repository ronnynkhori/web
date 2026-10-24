"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ChevronsUpDown, ExternalLink, LogOut, Menu } from "lucide-react";
import { logout } from "@/app/admin/actions/auth";
import { cn } from "@/lib/utils";
import { AdminIcon } from "./admin-icon";
import { AdminLanguageSwitch, useT } from "./i18n";
import { isActive, type AdminNavGroup, type AdminNavItem } from "./nav-items";
import { initials } from "./time";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";

export interface FrameUser {
  name: string;
  email: string;
  role: string;
}

interface FrameProps {
  groups: AdminNavGroup[];
  tabs: AdminNavItem[];
  user: FrameUser;
  pending: number;
  defaultOpen: boolean;
  notice?: ReactNode;
  children: ReactNode;
}

function UserMenu({ user, side, children }: { user: FrameUser; side: "top" | "bottom"; children: ReactNode }) {
  const t = useT();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="truncate font-semibold">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          <span className="text-xs text-primary">{user.role}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/en" target="_blank">
            <ExternalLink /> {t("View public site")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logout}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut /> {t("Sign out")}
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Brand() {
  const t = useT();
  return (
    <Link href="/admin" className="flex items-center gap-3 rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white p-1 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0.5">
        <Image src="/images/brand/cplp-emblem.png" alt="" width={512} height={512} className="size-9 rounded-md bg-white p-0.5 group-data-[collapsible=icon]:size-7" sizes="40px" preload />
      </span>
      <span className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
        <span className="font-display text-xl tracking-wide">{t("Games Control Room")}</span>
        <span className="flex flex-col text-xs leading-snug text-sidebar-foreground/70">
          {t("XIII CPLP Games · Angola 2027")
            .split(" · ")
            .map((part) => (
              <span key={part}>{part}</span>
            ))}
        </span>
      </span>
    </Link>
  );
}

function AppSidebar({ groups, user, pending }: Pick<FrameProps, "groups" | "user" | "pending">) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const t = useT();
  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4 group-data-[collapsible=icon]:px-2">
        <Brand />
      </SidebarHeader>
      <SidebarContent className="gap-0 py-2">
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="py-1.5">
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-[0.12em] text-sidebar-foreground/60 uppercase">{t(group.label)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={t(item.label)}
                        className="h-11 gap-3 text-[0.9rem] text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:font-semibold data-[active=true]:text-sidebar-primary-foreground md:h-9"
                      >
                        <Link href={item.href} onClick={() => setOpenMobile(false)}>
                          <AdminIcon name={item.icon} />
                          <span>{t(item.label)}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.href === "/admin/approvals" && pending > 0 && (
                        <SidebarMenuBadge className="rounded-full bg-live text-live-foreground peer-data-[active=true]/menu-button:text-live-foreground">
                          {pending}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <UserMenu user={user} side="top">
          <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent hover:text-sidebar-foreground data-[state=open]:bg-sidebar-accent">
            <Avatar className="size-8 rounded-md">
              <AvatarFallback className="rounded-md bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">{initials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-1 flex-col text-left leading-tight">
              <span className="truncate text-sm font-semibold">{user.name}</span>
              <span className="truncate text-xs text-sidebar-foreground/70">{user.role}</span>
            </span>
            <ChevronsUpDown className="ml-auto size-4 opacity-70" />
          </SidebarMenuButton>
        </UserMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function sectionLabel(groups: AdminNavGroup[], pathname: string) {
  const items = groups.flatMap((g) => g.items).filter((i) => isActive(pathname, i.href));
  return items.sort((a, b) => b.href.length - a.href.length)[0]?.label ?? "Control Room";
}

function TopBar({ groups, user }: Pick<FrameProps, "groups" | "user">) {
  const pathname = usePathname();
  const t = useT();
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3 pt-[env(safe-area-inset-top)] md:h-16 md:px-6">
      <SidebarTrigger className="hidden md:inline-flex" />
      <Separator orientation="vertical" className="mr-1 hidden data-[orientation=vertical]:h-5 md:block" />
      <Link href="/admin" className="grid size-9 shrink-0 place-items-center rounded-md border bg-white p-0.5 md:hidden" aria-label={t("Control Room home")}>
        <Image src="/images/brand/cplp-emblem.png" alt="" width={512} height={512} className="size-8 rounded-md bg-white p-0.5" sizes="36px" />
      </Link>
      <p className="min-w-0 flex-1 truncate text-sm font-semibold md:text-base">{t(sectionLabel(groups, pathname))}</p>
      <AdminLanguageSwitch />
      <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
        <Link href="/en" target="_blank">
          <ExternalLink /> {t("View site")}
        </Link>
      </Button>
      <UserMenu user={user} side="bottom">
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={t("Account: {name}", { name: user.name })}>
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">{initials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </UserMenu>
    </header>
  );
}

/** Phone navigation: the role's three busiest areas plus "More" (the full menu). */
function TabBar({ tabs, pending }: Pick<FrameProps, "tabs" | "pending">) {
  const pathname = usePathname();
  const { openMobile, setOpenMobile } = useSidebar();
  const t = useT();
  const anyActive = tabs.some((tab) => isActive(pathname, tab.href));
  const tabClass = "relative flex min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold";
  return (
    <nav
      aria-label={t("Quick navigation")}
      className="fixed inset-x-0 bottom-0 z-40 grid h-[var(--tabbar-h)] grid-cols-4 border-t border-sidebar-border bg-sidebar pb-[env(safe-area-inset-bottom)] text-sidebar-foreground md:hidden"
    >
      {tabs.map((tab) => {
        const active = isActive(pathname, tab.href) && !openMobile;
        return (
          <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={cn(tabClass, active ? "text-sidebar-primary" : "text-sidebar-foreground/75")}>
            {active && <span aria-hidden="true" className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-sidebar-primary" />}
            <span className="relative">
              <AdminIcon name={tab.icon} className="size-6" />
              {tab.href === "/admin/approvals" && pending > 0 && (
                <span className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-live px-1 text-[10px] text-live-foreground">{pending}</span>
              )}
            </span>
            <span className="max-w-full truncate px-1">{t(tab.short ?? tab.label)}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => setOpenMobile(!openMobile)}
        aria-expanded={openMobile}
        className={cn(tabClass, openMobile || !anyActive ? "text-sidebar-primary" : "text-sidebar-foreground/75")}
      >
        <Menu className="size-6" aria-hidden="true" />
        {t("More")}
      </button>
    </nav>
  );
}

/** Laptops (768-1279px) start with the icon rail so the page keeps its width; the toggle still opens it. */
function LaptopRail() {
  const { setOpen } = useSidebar();
  useEffect(() => {
    if (window.matchMedia("(min-width: 768px) and (max-width: 1279px)").matches) setOpen(false);
  }, [setOpen]);
  return null;
}

export function AdminFrame({ groups, tabs, user, pending, defaultOpen, notice, children }: FrameProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <LaptopRail />
      <AppSidebar groups={groups} user={user} pending={pending} />
      <SidebarInset className="min-w-0 bg-background">
        <TopBar groups={groups} user={user} />
        {notice}
        <main className="mx-auto w-full max-w-[90rem] px-4 pt-5 pb-[calc(var(--tabbar-h)+1.5rem)] md:px-6 md:pt-7 md:pb-12 lg:px-10">{children}</main>
      </SidebarInset>
      <TabBar tabs={tabs} pending={pending} />
    </SidebarProvider>
  );
}
