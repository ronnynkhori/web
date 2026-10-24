import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { Database } from "lucide-react";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { loadItems } from "@/lib/admin/mutate";
import { can, roleLabels } from "@/lib/admin/roles";
import type { EventResultDoc, MatchDoc } from "@/lib/cms/types";
import { getStore } from "@/lib/store";
import { AdminFrame } from "./admin-frame";
import { AdminI18nProvider } from "./i18n";
import { adminNav, phoneTabsFor } from "./nav-items";

async function pendingCount(): Promise<number> {
  const [matches, results] = await Promise.all([loadItems<MatchDoc>("matches"), loadItems<EventResultDoc>("results")]);
  return matches.filter((m) => m.approval === "pending").length + results.filter((r) => r.approval === "pending").length;
}

/** Sidebar (desktop), tab bar (phones) and top bar around every signed-in Control Room page. */
export async function AdminShell({ children }: { children: ReactNode }) {
  const session = await requireUser();
  const store = getStore();
  const groups = adminNav
    .map((g) => ({ ...g, items: g.items.filter((i) => can(session.role, i.area)) }))
    .filter((g) => g.items.length);
  const [jar, pending, locale] = await Promise.all([
    cookies(),
    can(session.role, "approvals") ? pendingCount() : Promise.resolve(0),
    getAdminLocale(),
  ]);
  const t = translator(locale);

  const notice =
    store.kind === "local" ? (
      <p className="flex items-start gap-2 border-b border-warning bg-warning px-4 py-2 text-xs font-medium text-warning-foreground md:px-8">
        <Database className="mt-px size-4 shrink-0" aria-hidden="true" />
        {store.writable
          ? t("Local mode: changes are saved to .data/store.json on this computer. Connect Supabase for the live site.")
          : t("Read-only: this deployment has no database. Add Supabase from the Vercel Marketplace to enable saving.")}
      </p>
    ) : null;

  return (
    <AdminI18nProvider locale={locale}>
      <div lang={locale} className="contents">
        <AdminFrame
          groups={groups}
          tabs={phoneTabsFor(session.role)}
          user={{ name: session.name, email: session.email, role: t(roleLabels[session.role]) }}
          pending={pending}
          defaultOpen={jar.get("sidebar_state")?.value !== "false"}
          notice={notice}
        >
          {children}
        </AdminFrame>
      </div>
    </AdminI18nProvider>
  );
}
