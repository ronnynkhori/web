import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import type { BulkResult } from "@/app/admin/actions/content";
import { getT } from "@/lib/admin/i18n/server";
import type { Translate } from "@/lib/admin/i18n/translate";
import { ConfirmAction } from "./confirm-action";
import { IconAction } from "./icon-action";
import { BulkSelect, SelectAllBox, SelectBox } from "./item-list-select";
import { StatusBadge, type Tone } from "./status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export interface ListRow {
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  badges?: Array<{ label: string; tone: Tone }>;
  /** e.g. "Updated 5 min ago by ana" */
  meta?: string;
  leading?: ReactNode;
  actions?: ReactNode;
  /** Bound server action; adds a trash button behind a confirmation. */
  deleteAction?: (form: FormData) => Promise<void>;
  deleteDescription?: string;
}

export interface BulkDelete {
  action: (ids: string[]) => Promise<BulkResult>;
  /** Plural, e.g. "announcements". */
  noun: string;
  description?: string;
}

function Badges({ badges }: { badges?: ListRow["badges"] }) {
  if (!badges?.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <StatusBadge key={b.label} tone={b.tone}>
          {b.label}
        </StatusBadge>
      ))}
    </span>
  );
}

function RowDelete({ row, t }: { row: ListRow; t: Translate }) {
  if (!row.deleteAction) return null;
  return (
    <ConfirmAction
      action={row.deleteAction}
      title={t("Delete “{title}”?", { title: row.title })}
      description={t(row.deleteDescription ?? "It disappears from the public site immediately. This cannot be undone.")}
      confirmLabel={t("Delete")}
      destructive
      trigger={<IconAction label={t("Delete {title}", { title: row.title })} icon={<Trash2 />} destructive />}
    />
  );
}

/**
 * Every Control Room list: a table on desktop, tappable cards on phones.
 * Same rows, same badges, same actions, so each screen reads the same way.
 * With `bulkDelete`, rows get tick boxes and a "Delete selected" bar.
 */
export async function ItemList({
  rows,
  label,
  editLabel = "Edit",
  bulkDelete,
}: {
  rows: ListRow[];
  label: string;
  editLabel?: string;
  bulkDelete?: BulkDelete;
}) {
  const t = await getT();
  const selectable = Boolean(bulkDelete);
  const list = (
    <>
      <ul aria-label={label} className="flex flex-col divide-y overflow-hidden rounded-xl border bg-card md:hidden">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col">
            <div className="flex items-center">
              {selectable && (
                <span className="flex self-stretch items-center pl-4">
                  <SelectBox id={r.id} label={r.title} />
                </span>
              )}
              <Link href={r.href} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 active:bg-accent">
                {r.leading}
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Badges badges={r.badges} />
                  <span className="font-semibold leading-snug">{r.title}</span>
                  {r.subtitle && <span className="truncate text-xs text-muted-foreground">{r.subtitle}</span>}
                  {r.meta && <span className="text-xs text-muted-foreground">{r.meta}</span>}
                </span>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </div>
            {(r.actions || r.deleteAction) && (
              <div className="flex justify-end gap-2 px-4 pb-3">
                {r.actions}
                <RowDelete row={r} t={t} />
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table aria-label={label}>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              {selectable && (
                <TableHead className="h-11 w-10 pl-5">
                  <SelectAllBox />
                </TableHead>
              )}
              <TableHead className={selectable ? "h-11" : "h-11 pl-5"}>{t("Item")}</TableHead>
              <TableHead className="h-11 w-[13rem]">{t("Status")}</TableHead>
              <TableHead className="h-11 w-[12rem]">{t("Last change")}</TableHead>
              <TableHead className="h-11 w-[1%] pr-5 text-right">
                <span className="sr-only">{t("Actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="group">
                {selectable && (
                  <TableCell className="py-3 pl-5">
                    <SelectBox id={r.id} label={r.title} />
                  </TableCell>
                )}
                <TableCell className={selectable ? "max-w-0 py-3" : "max-w-0 py-3 pl-5"}>
                  <div className="flex items-center gap-3">
                    {r.leading}
                    <div className="flex min-w-0 flex-col">
                      <Link href={r.href} className="truncate font-semibold group-hover:text-primary hover:underline">
                        {r.title}
                      </Link>
                      {r.subtitle && <span className="truncate text-xs text-muted-foreground">{r.subtitle}</span>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 whitespace-normal">
                  <Badges badges={r.badges} />
                </TableCell>
                <TableCell className="py-3 text-xs whitespace-normal text-muted-foreground">{r.meta}</TableCell>
                <TableCell className="py-3 pr-5">
                  <div className="flex items-center justify-end gap-1.5">
                    {r.actions}
                    <IconAction href={r.href} label={t("{action} {title}", { action: t(editLabel), title: r.title })} icon={<Pencil />} />
                    <RowDelete row={r} t={t} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );

  return bulkDelete ? (
    <BulkSelect ids={rows.map((r) => r.id)} action={bulkDelete.action} noun={bulkDelete.noun} description={bulkDelete.description}>
      {list}
    </BulkSelect>
  ) : (
    list
  );
}
