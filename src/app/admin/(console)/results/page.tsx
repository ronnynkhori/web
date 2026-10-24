import { deleteEventResult, deleteEventResults } from "@/app/admin/actions/results";
import { EmptyState } from "@/components/admin/empty-state";
import { Flash } from "@/components/admin/flash";
import { ItemList, type ListRow } from "@/components/admin/item-list";
import { MobileBarSpacer, PageHeader } from "@/components/admin/page-header";
import type { Tone } from "@/components/admin/status-badge";
import { relativeTime, shortName } from "@/components/admin/time";
import { sports } from "@/data/sports";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { loadItems } from "@/lib/admin/mutate";
import { canApprove } from "@/lib/admin/roles";
import type { Approval, EventResultDoc } from "@/lib/cms/types";
import { pick } from "@/lib/i18n/config";

const approvalBadge: Record<Approval, { label: string; tone: Tone }> = {
  approved: { label: "Published", tone: "success" },
  pending: { label: "Waiting for approval", tone: "warning" },
  draft: { label: "Draft", tone: "neutral" },
  rejected: { label: "Returned", tone: "error" },
};

const savedMessage: Record<string, string> = {
  publish: "Published. The result and the medal table are live on the site.",
  submit: "Sent for approval. A results manager will publish it.",
  draft: "Draft saved. It is not visible on the site.",
};

export default async function ResultsPage({ searchParams }: PageProps<"/admin/results">) {
  const session = await requireUser("results");
  const locale = await getAdminLocale();
  const t = translator(locale);
  const query = await searchParams;
  const all = await loadItems<EventResultDoc>("results");
  const items = (session.role === "scorer" ? all.filter((r) => session.sportIds.includes(r.sportId)) : all).sort((a, b) =>
    (b._updatedAt ?? "").localeCompare(a._updatedAt ?? ""),
  );
  const saved = typeof query.saved === "string" ? savedMessage[query.saved] : undefined;
  const approver = canApprove(session.role);

  const rows: ListRow[] = items.map((r) => {
    const podium = [...(r.published ?? r.draft)].sort((a, b) => a.rank - b.rank).slice(0, 3);
    const sport = sports.find((s) => s.id === r.sportId);
    const badge = approvalBadge[r.approval];
    return {
      id: r.id,
      href: `/admin/results/${r.id}`,
      title: pick(r.event, locale) || t("(untitled event)"),
      subtitle: [sport && pick(sport.name, locale), podium.map((p) => `${p.rank}. ${p.athlete} (${p.countryCode})`).join(" · ") || t("No placings yet")]
        .filter(Boolean)
        .join(" — "),
      badges: [
        { label: t(badge.label), tone: badge.tone },
        ...(r.medalEvent ? [{ label: t("Medal event"), tone: "brand" as const }] : []),
        ...(r.corrected ? [{ label: t("Corrected"), tone: "info" as const }] : []),
      ],
      meta: r._updatedAt ? `${relativeTime(r._updatedAt, t)}${r._updatedBy ? ` · ${shortName(r._updatedBy, t)}` : ""}` : undefined,
      deleteAction: approver ? deleteEventResult.bind(null, r.id) : undefined,
      deleteDescription: "Its medals are removed from the medal table on the site. This cannot be undone.",
    };
  });

  return (
    <>
      <Flash param="saved" message={saved} />
      <Flash param="deleted" message={query.deleted ? "Result deleted. The medal table is updated." : null} />
      <PageHeader
        title={t("Event results")}
        description={t(
          "Ranked results for athletics, swimming, judo, taekwondo and other individual events. Published medal events update the medal table automatically.",
        )}
        icon="list"
        primary={{ href: "/admin/results/new", label: t("Add event result") }}
      />
      {items.length === 0 ? (
        <EmptyState icon="list" title={t("No results yet")}>
          {t("Use “Add event result” to enter the first placings.")}
        </EmptyState>
      ) : (
        <ItemList
          rows={rows}
          label={t("Event results")}
          bulkDelete={
            approver
              ? { action: deleteEventResults, noun: "results", description: "Their medals are removed from the medal table on the site. This cannot be undone." }
              : undefined
          }
        />
      )}
      <MobileBarSpacer />
    </>
  );
}
