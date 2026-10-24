import { notFound } from "next/navigation";
import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";
import { deleteItem, deleteItems, moveItem } from "@/app/admin/actions/content";
import { EmptyState } from "@/components/admin/empty-state";
import { FaqTester } from "@/components/admin/faq-tester";
import { IconAction } from "@/components/admin/icon-action";
import { Flash } from "@/components/admin/flash";
import { ItemList, type ListRow } from "@/components/admin/item-list";
import { MobileBarSpacer, PageHeader } from "@/components/admin/page-header";
import { relativeTime, shortName } from "@/components/admin/time";
import { Button } from "@/components/admin/ui/button";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale, getT } from "@/lib/admin/i18n/server";
import { loadItems } from "@/lib/admin/mutate";
import { getCollectionDef, missingTranslations } from "@/lib/admin/schemas";
import type { FaqDoc } from "@/lib/cms/types";

function Thumb({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <span className="size-11 shrink-0 overflow-hidden rounded-md border bg-muted">
      {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary uploaded URL */}
      <img src={src} alt="" className="size-full object-cover" loading="lazy" />
    </span>
  );
}

export default async function CollectionPage({ params, searchParams }: PageProps<"/admin/c/[collection]">) {
  const { collection } = await params;
  const def = getCollectionDef(collection);
  if (!def) notFound();
  await requireUser(def.area);
  const [t, locale] = await Promise.all([getT(), getAdminLocale()]);
  const query = await searchParams;
  const items = await loadItems(def.id);
  const href = (id: string) => `/admin/c/${def.id}/${encodeURIComponent(id)}`;
  const label = t(def.label);
  const plural = t(def.label.toLowerCase());
  const singular = t(def.singular);

  const rows: ListRow[] = items.map((item, index) => {
    const doc = item as unknown as Record<string, unknown>;
    const missing = missingTranslations(def, doc);
    const image = (doc.image ?? doc.logo) as { src?: string } | undefined;
    const when = item._updatedAt ? relativeTime(item._updatedAt, t) : "";
    return {
      id: item.id,
      href: href(item.id),
      title: def.title(doc) || t("(untitled)"),
      subtitle: def.subtitle?.(doc, t, locale),
      leading: <Thumb src={image?.src} />,
      badges: [
        ...(def.badges?.(doc, t, locale) ?? []),
        ...(missing.length ? [{ label: t("{langs} missing", { langs: missing.join(" + ") }), tone: "warning" as const }] : []),
      ],
      meta: item._updatedAt ? (item._updatedBy ? t("{time} · {name}", { time: when, name: shortName(item._updatedBy, t) }) : when) : undefined,
      deleteAction: deleteItem.bind(null, def.id, item.id),
      actions: def.orderable ? (
        <>
          <form action={moveItem.bind(null, def.id, item.id, -1)}>
            <IconAction type="submit" label={t("Move up")} icon={<ArrowUp />} disabled={index === 0} />
          </form>
          <form action={moveItem.bind(null, def.id, item.id, 1)}>
            <IconAction type="submit" label={t("Move down")} icon={<ArrowDown />} disabled={index === items.length - 1} />
          </form>
        </>
      ) : undefined,
    };
  });

  return (
    <>
      <Flash
        param={query.saved ? "saved" : "deleted"}
        message={query.saved ? "Saved. The public site shows it on the next page load." : query.deleted ? "Deleted. It is gone from the public site." : null}
      />
      <PageHeader
        title={label}
        description={t(def.description)}
        icon={def.icon}
        actions={
          <Button asChild variant="outline" size="sm">
            <a href={`/${locale}${def.publicAnchor}`} target="_blank" rel="noreferrer">
              <ExternalLink /> {t("View on site")}
            </a>
          </Button>
        }
        primary={{ href: href("new"), label: t("Add {item}", { item: singular }) }}
      />

      <div className="flex flex-col gap-8">
        {items.length === 0 ? (
          <EmptyState icon={def.icon} title={t("No {items} yet", { items: plural })}>
            {t("Use “Add {item}” to create the first one.", { item: singular })}
          </EmptyState>
        ) : (
          <section aria-label={label} className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {items.length === 1 ? t("1 {item}", { item: singular }) : t("{n} {items}", { n: items.length, items: plural })}
              {def.orderable && t(" · shown on the site in this order")}
            </p>
            <ItemList rows={rows} label={label} bulkDelete={{ action: deleteItems.bind(null, def.id), noun: def.label.toLowerCase() }} />
          </section>
        )}

        {def.id === "faq" && (
          <FaqTester
            entries={(items as FaqDoc[]).map((f) => ({ id: f.id, keywords: f.keywords, question: f.question.en, answer: f.answer.en }))}
          />
        )}
      </div>
      <MobileBarSpacer />
    </>
  );
}
