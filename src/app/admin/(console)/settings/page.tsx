import { Database, Download, Eraser, Lightbulb, RefreshCw, Upload } from "lucide-react";
import { clearDemoResults, loadSiteContent, refreshManualContent, saveSettings } from "@/app/admin/actions/admin";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { DocForm } from "@/components/admin/doc-form";
import { Flash } from "@/components/admin/flash";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { requireUser } from "@/lib/admin/auth";
import { getT } from "@/lib/admin/i18n/server";
import { loadItems } from "@/lib/admin/mutate";
import { settingsFields, settingsValues } from "@/lib/admin/settings-fields";
import { defaultSettings } from "@/lib/cms/seed";
import type { SettingsDoc } from "@/lib/cms/types";
import { getStore } from "@/lib/store";

export default async function SettingsPage({ searchParams }: PageProps<"/admin/settings">) {
  const session = await requireUser("settings");
  const query = await searchParams;
  const settings = { ...defaultSettings, ...(await loadItems<SettingsDoc>("settings"))[0] };
  const store = getStore();
  const t = await getT();
  const flash = query.saved
    ? { param: "saved", message: t("Settings saved. The public site updates on the next page load."), tone: "success" as const }
    : query.seeded
      ? { param: "seeded", message: t("The current site content is now in the database and editable."), tone: "success" as const }
      : query.refreshed
        ? { param: "refreshed", message: t("Guide, FAQ, venues and nations now match the Chef de Mission manual."), tone: "success" as const }
      : query.cleared
        ? { param: "cleared", message: t("Demo results removed. Only real scores and results are now public."), tone: "success" as const }
      : query.restored
        ? { param: "restored", message: t("Backup restored. The public site shows the restored content now."), tone: "success" as const }
      : query.restoreFailed
        ? { param: "restoreFailed", message: t("Nothing was restored. Choose a backup file made here (under 4 MB) and tick the confirmation."), tone: "error" as const }
      : query.readonly
        ? { param: "readonly", message: t("This deployment cannot save. Connect Supabase first."), tone: "error" as const }
        : query.denied
          ? { param: "denied", message: t("Only a Super admin can do that."), tone: "error" as const }
          : null;

  return (
    <>
      {flash && <Flash param={flash.param} message={flash.message} tone={flash.tone} />}
      <PageHeader title={t("Site settings")} description={t("The alert banner, the home page phase and the main photo download link.")} icon="globe" />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <DocForm fields={settingsFields} values={settingsValues(settings)} action={saveSettings} submitLabel={t("Save settings")} cancelHref="/admin" />

        <aside className="flex flex-col gap-6">
          {session.role === "super" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Database className="size-[18px] text-primary" aria-hidden="true" /> {t("Database")}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {t("Storage")}
                  <StatusBadge tone={store.kind === "supabase" ? "success" : "warning"}>
                    {store.kind === "supabase" ? t("Supabase (production)") : t("Local file (development)")}
                  </StatusBadge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  {t(
                    "Copy everything the site shows today into the database so it can be edited. Collections that already have data are left untouched, except that new built-in guide topics and FAQ answers are added.",
                  )}
                </p>
                <ConfirmAction
                  action={loadSiteContent}
                  title={t("Load the current site content?")}
                  description={t(
                    "The built-in content is copied into the database. Collections that already have data are left untouched; missing built-in guide topics and FAQ answers are added.",
                  )}
                  confirmLabel={t("Load content")}
                  trigger={
                    <Button variant="secondary" className="w-full">
                      <Database /> {t("Load current site content")}
                    </Button>
                  }
                />
                <ConfirmAction
                  action={refreshManualContent}
                  title={t("Update guide, FAQ, venues and nations from the manual?")}
                  description={t(
                    "The built-in guide topics, FAQ answers, venues and nations are replaced with the latest copy from the Chef de Mission manual. Items you added yourself are kept, as are uploaded photos and flags, venue map links and delegation figures. Edits to the built-in text are overwritten, so download a backup first.",
                  )}
                  confirmLabel={t("Update content")}
                  trigger={
                    <Button variant="secondary" className="w-full">
                      <RefreshCw /> {t("Update from the CDM manual")}
                    </Button>
                  }
                />
                <ConfirmAction
                  action={clearDemoResults}
                  title={t("Clear the demo results?")}
                  description={t(
                    "Simulated scores, results and medals are deleted so only real entries remain. The public live hub then shows nothing until the first real result. Download a backup first if unsure.",
                  )}
                  confirmLabel={t("Clear demo results")}
                  destructive
                  trigger={
                    <Button variant="outline" className="w-full">
                      <Eraser /> {t("Clear demo results")}
                    </Button>
                  }
                />
                <Button asChild variant="outline" className="w-full">
                  <a href="/api/admin/export" download>
                    <Download /> {t("Download a full backup (JSON)")}
                  </a>
                </Button>
                <form action="/api/admin/restore" method="post" encType="multipart/form-data" className="flex flex-col gap-3 border-t pt-4">
                  <p className="text-sm font-medium">{t("Restore a backup")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("Replaces every collection in the file with the backup copy. Users keep their current passwords. Download a backup of the current state first.")}
                  </p>
                  <input
                    type="file"
                    name="backup"
                    accept="application/json,.json"
                    required
                    aria-label={t("Backup file")}
                    className="text-sm file:mr-3 file:rounded-md file:border file:bg-card file:px-3 file:py-1.5 file:text-sm"
                  />
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" name="confirm" value="yes" required className="mt-0.5 size-4" />
                    {t("I understand this replaces the current content.")}
                  </label>
                  <Button type="submit" variant="outline" className="w-full">
                    <Upload /> {t("Restore backup")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          <Card className="bg-secondary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="size-[18px] text-primary" aria-hidden="true" /> {t("Banner tips")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-secondary-foreground">
                <li>{t("The banner shows on every page until visitors close it, and again for new visitors.")}</li>
                <li>{t("Switch the banner off as soon as the situation is resolved.")}</li>
                <li>{t("Post the full details as an announcement and link the banner to it.")}</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  );
}
