"use client";

import { motion } from "motion/react";
import { useId, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { fill } from "@/lib/i18n/config";
import { bezier, seconds } from "@/lib/animation/tokens";
import { Icon } from "./icon";

export interface Column<T> {
  key: string;
  header: string;
  /** Short visible header (e.g. "G"); `header` becomes the accessible name. */
  shortHeader?: string;
  /** Decorative mark shown before the visible header (e.g. a medal disc). */
  headerMark?: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "start" | "end";
  /**
   * primary   - always visible, including the mobile card-row summary
   * detail    - visible in the table at all widths; inside the mobile expand panel
   * secondary - hidden on tablet; inside the mobile expand panel
   */
  priority?: "primary" | "detail" | "secondary";
  sortValue?: (row: T) => number | string;
  /** Marks the cell as the row header (<th scope="row">). */
  rowHeader?: boolean;
  className?: string;
}

export interface DataTableLabels {
  empty: string;
  expand: string;
  collapse: string;
  sortBy: string;
  sortedAsc: string;
  sortedDesc: string;
}

interface DataTableProps<T> {
  caption: string;
  captionVisible?: boolean;
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  labels: DataTableLabels;
  /** Gold left border (winner / leader). */
  isAccentRow?: (row: T) => boolean;
  /** Rows to highlight after a live update (outline, not motion). */
  highlighted?: ReadonlySet<string>;
  /** Animate row reordering with Motion `layout` (medal table, concept 10). */
  animateReorder?: boolean;
  className?: string;
}

type Sort = { key: string; dir: "asc" | "desc" } | null;

/**
 * Primitive 7/8 - DataTable + DataRow. Result table, medal table, rankings,
 * standings. D: full table · T: secondary columns hidden · M: card-rows with
 * tap to expand, same reading order and labels.
 */
export function DataTable<T>({
  caption,
  captionVisible = false,
  columns,
  rows,
  getRowKey,
  labels,
  isAccentRow,
  highlighted,
  animateReorder,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<Sort>(null);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const id = useId();

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const val = col.sortValue;
    return [...rows].sort((a, b) => {
      const va = val(a), vb = val(b);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, columns, sort]);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? (s.dir === "desc" ? { key, dir: "asc" } : null) : { key, dir: "desc" }));

  const toggleRow = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const transition = { duration: seconds("content"), ease: bezier("standard") };
  const Row = animateReorder ? motion.tr : "tr";
  const MobileRow = animateReorder ? motion.li : "li";
  const primary = columns.filter((c) => !c.priority || c.priority === "primary");
  const secondary = columns.filter((c) => c.priority === "secondary" || c.priority === "detail");

  if (rows.length === 0) {
    return <p className="rounded-xs border border-line bg-surface-2 p-5 type-body-m text-fg-muted">{labels.empty}</p>;
  }

  return (
    <div className={className}>
      {/* Tablet and up: real table, scrolls inside its own container */}
      <div className="hidden overflow-x-auto rounded-xs border border-line tablet:block">
        <table className="w-full border-collapse bg-surface-raised">
          <caption className={cn(captionVisible ? "p-4 text-left type-label text-fg-muted" : "sr-only")}>{caption}</caption>
          <thead>
            <tr>
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn(
                      "border-b-2 border-line px-3 py-3 type-label text-fg-muted",
                      col.align === "end" ? "text-right" : "text-left",
                      col.priority === "secondary" && "hidden desktop:table-cell",
                    )}
                  >
                    {col.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          "inline-flex min-h-touch items-center gap-1 uppercase hover:text-fg",
                          col.align === "end" && "flex-row-reverse",
                        )}
                        aria-label={fill(labels.sortBy, { column: col.header })}
                      >
                        {col.headerMark}
                        <span aria-hidden={col.shortHeader ? true : undefined}>{col.shortHeader ?? col.header}</span>
                        <Icon
                          name={active ? (sort.dir === "asc" ? "arrow-up" : "arrow-down") : "chevron-down"}
                          size={16}
                          className={active ? "text-accent" : "opacity-40"}
                        />
                      </button>
                    ) : (
                      <>
                        {col.headerMark}
                        <span aria-hidden={col.shortHeader ? true : undefined}>{col.shortHeader ?? col.header}</span>
                        {col.shortHeader && <span className="sr-only">{col.header}</span>}
                      </>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const key = getRowKey(row);
              const accent = isAccentRow?.(row);
              return (
                <Row
                  key={key}
                  {...(animateReorder ? { layout: "position" as const, transition } : {})}
                  className={cn(
                    "border-b border-line last:border-b-0",
                    highlighted?.has(key) && "outline-2 -outline-offset-2 outline-line-accent",
                  )}
                >
                  {columns.map((col, ci) => {
                    const Cell = col.rowHeader ? "th" : "td";
                    return (
                      <Cell
                        key={col.key}
                        scope={col.rowHeader ? "row" : undefined}
                        className={cn(
                          "px-3 py-3 type-body-m font-semibold tabular",
                          col.align === "end" ? "text-right" : "text-left",
                          col.priority === "secondary" && "hidden desktop:table-cell",
                          ci === 0 && accent && "border-l-4 border-l-line-accent",
                          col.className,
                        )}
                      >
                        {col.cell(row)}
                      </Cell>
                    );
                  })}
                </Row>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: card-rows, tap to expand. Same order and labels as the table. */}
      <div className="tablet:hidden">
        <p className="sr-only" id={`${id}-cap`}>
          {caption}
        </p>
        <ul aria-labelledby={`${id}-cap`} className="flex flex-col gap-2">
          {sorted.map((row) => {
            const key = getRowKey(row);
            const expanded = open.has(key);
            const detailsId = `${id}-${key}`;
            return (
              <MobileRow
                key={key}
                {...(animateReorder ? { layout: "position" as const, transition } : {})}
                className={cn(
                  "rounded-xs border border-line bg-surface-raised",
                  isAccentRow?.(row) && "border-l-4 border-l-line-accent",
                  highlighted?.has(key) && "outline-2 -outline-offset-2 outline-line-accent",
                )}
              >
                {secondary.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => toggleRow(key)}
                    aria-expanded={expanded}
                    aria-controls={detailsId}
                    className="flex min-h-touch-lg w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <Summary columns={primary} row={row} />
                    <span className="sr-only">{expanded ? labels.collapse : labels.expand}</span>
                    <Icon name="chevron-down" className={cn("shrink-0 transition-transform duration-ui", expanded && "rotate-180")} />
                  </button>
                ) : (
                  <div className="flex min-h-touch-lg items-center gap-3 px-4 py-3">
                    <Summary columns={primary} row={row} />
                  </div>
                )}
                {secondary.length > 0 && (
                  <dl id={detailsId} hidden={!expanded} className="m-0 grid grid-cols-2 gap-3 border-t border-line px-4 py-3">
                    {secondary.map((col) => (
                      <div key={col.key}>
                        <dt className="type-caption text-fg-muted">{col.header}</dt>
                        <dd className="m-0 type-body-s font-semibold">{col.cell(row)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </MobileRow>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Summary<T>({ columns, row }: { columns: Column<T>[]; row: T }) {
  return (
    <dl className="m-0 flex flex-1 flex-wrap items-baseline gap-x-4 gap-y-1">
      {columns.map((col) => (
        <div key={col.key} className={cn("flex items-baseline gap-1", col.rowHeader && "flex-1 basis-1/2")}>
          <dt className={cn("type-caption text-fg-muted", col.rowHeader && "sr-only")}>{col.shortHeader ?? col.header}</dt>
          <dd className="m-0 type-body-m font-semibold tabular">{col.cell(row)}</dd>
        </div>
      ))}
    </dl>
  );
}
