import { notFound } from "next/navigation";
import { Clock, Trash2, TriangleAlert } from "lucide-react";
import { deleteEventResult } from "@/app/admin/actions/results";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { PageHeader } from "@/components/admin/page-header";
import { ResultEditor } from "@/components/admin/result-editor";
import { Alert, AlertDescription, AlertTitle } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { sports } from "@/data/sports";
import { requireUser } from "@/lib/admin/auth";
import { getAdminCountries } from "@/lib/admin/countries";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { loadItems } from "@/lib/admin/mutate";
import { canApprove } from "@/lib/admin/roles";
import type { EventResultDoc } from "@/lib/cms/types";
import { pick } from "@/lib/i18n/config";
import { matchSportIds } from "@/lib/live/scoring";

export default async function EventResultPage({ params }: PageProps<"/admin/results/[id]">) {
  const session = await requireUser("results");
  const locale = await getAdminLocale();
  const t = translator(locale);
  const { id } = await params;
  const isNew = id === "new";
  const doc = isNew ? undefined : (await loadItems<EventResultDoc>("results")).find((r) => r.id === id);
  if (!isNew && !doc) notFound();
  const approver = canApprove(session.role);
  const allowed = sports.filter(
    (s) => !matchSportIds.includes(s.id) && (session.role !== "scorer" || session.sportIds.includes(s.id)),
  );
  if (doc && session.role === "scorer" && !session.sportIds.includes(doc.sportId)) notFound();
  const meta = doc?.pendingMeta ?? doc;
  const countries = (await getAdminCountries()).map((c) => ({ code: c.code, name: pick(c.name, locale) }));

  return (
    <div className="max-w-6xl">
      <PageHeader
        title={doc ? pick(doc.event, locale) || t("Event result") : t("New event result")}
        back={{ href: "/admin/results", label: t("Event results") }}
        actions={
          doc &&
          approver && (
            <ConfirmAction
              action={deleteEventResult.bind(null, doc.id)}
              title={t("Delete this result?")}
              description={t("Its medals are removed from the medal table on the site.")}
              confirmLabel={t("Delete result")}
              destructive
              trigger={
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 /> {t("Delete")}
                </Button>
              }
            />
          )
        }
      />
      <div className="flex flex-col gap-5">
        {doc?.approval === "rejected" && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>{t("Returned by the results manager")}</AlertTitle>
            {doc.note && <AlertDescription>{t(doc.note)}</AlertDescription>}
          </Alert>
        )}
        {doc?.approval === "pending" && (
          <Alert className="border-highlight bg-warning text-warning-foreground">
            <Clock />
            <AlertTitle>{t("Waiting for approval")}</AlertTitle>
            <AlertDescription className="text-warning-foreground">
              {doc.pendingMeta
                ? t("The site still shows the last published version (as \"{event}\").", { event: pick(doc.event, locale) })
                : t("The site still shows the last published version.")}
            </AlertDescription>
          </Alert>
        )}
        <ResultEditor
          id={doc?.id ?? null}
          sports={allowed.map((s) => ({ id: s.id, name: pick(s.name, locale) }))}
          countries={countries}
          initial={{
            sportId: meta?.sportId ?? allowed[0]?.id ?? "",
            event: meta?.event ?? { en: "", pt: "", fr: "" },
            medalEvent: meta?.medalEvent ?? true,
            rows: doc?.draft ?? [],
          }}
          canPublish={approver}
        />
      </div>
    </div>
  );
}
