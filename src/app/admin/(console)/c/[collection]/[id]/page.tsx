import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteItem, saveItem } from "@/app/admin/actions/content";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { DocForm } from "@/components/admin/doc-form";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { relativeTime, shortName } from "@/components/admin/time";
import { Button } from "@/components/admin/ui/button";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale, getT } from "@/lib/admin/i18n/server";
import { loadItems } from "@/lib/admin/mutate";
import { getCollectionDef } from "@/lib/admin/schemas";

export default async function EditItemPage({ params }: PageProps<"/admin/c/[collection]/[id]">) {
  const { collection, id: rawId } = await params;
  const def = getCollectionDef(collection);
  if (!def) notFound();
  await requireUser(def.area);
  const [t, locale] = await Promise.all([getT(), getAdminLocale()]);

  const id = decodeURIComponent(rawId);
  const isNew = id === "new";
  const items = await loadItems(def.id);
  const existing = isNew ? undefined : items.find((d) => d.id === id);
  if (!isNew && !existing) notFound();
  const values = { ...def.defaults(), ...existing } as Record<string, unknown>;
  const badges = isNew ? [] : (def.badges?.(values, t, locale) ?? []);
  const singular = t(def.singular);

  return (
    <div>
      <PageHeader
        title={isNew ? t("New {item}", { item: singular }) : def.title(values) || t("Edit {item}", { item: singular })}
        back={{ href: `/admin/c/${def.id}`, label: t(def.label) }}
        meta={
          (badges.length > 0 || existing?._updatedAt) && (
            <>
              {badges.map((b) => (
                <StatusBadge key={b.label} tone={b.tone}>
                  {b.label}
                </StatusBadge>
              ))}
              {existing?._updatedAt && (
                <span className="text-xs text-muted-foreground">
                  {existing._updatedBy
                    ? t("Updated {time} by {name}", { time: relativeTime(existing._updatedAt, t), name: shortName(existing._updatedBy, t) })
                    : t("Updated {time}", { time: relativeTime(existing._updatedAt, t) })}
                </span>
              )}
            </>
          )
        }
        description={isNew ? t(def.description) : undefined}
        actions={
          !isNew && (
            <ConfirmAction
              action={deleteItem.bind(null, def.id, id)}
              title={t("Delete this {item}?", { item: singular })}
              description={t("It disappears from the public site immediately. This cannot be undone.")}
              confirmLabel={t("Delete {item}", { item: singular })}
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
      <DocForm
        fields={def.fields}
        values={values}
        action={saveItem.bind(null, def.id, isNew ? null : id)}
        submitLabel={isNew ? t("Create {item}", { item: singular }) : t("Save changes")}
        cancelHref={`/admin/c/${def.id}`}
      />
    </div>
  );
}
