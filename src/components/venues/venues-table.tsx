"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { fill } from "@/lib/i18n/config";

export interface VenueRow {
  id: string;
  name: string;
  sport: string;
  area?: string;
  map?: string;
}

interface Labels {
  title: string;
  caption: string;
  venue: string;
  sports: string;
  openMap: string;
  pages: string;
  showing: string;
  prevPage: string;
  nextPage: string;
  pageN: string;
}

const PAGE_SIZE = 6;

function MapLink({ row, label, className }: { row: VenueRow; label: string; className?: string }) {
  if (!row.map) return null;
  return (
    <a
      href={row.map}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={`${label}: ${row.name}`}
      className={cn(
        "grid size-touch shrink-0 place-items-center rounded-sm border border-line text-link transition-colors duration-ui hover:border-line-strong hover:bg-surface-2",
        className,
      )}
    >
      <Icon name="pin" size={20} />
    </a>
  );
}

function SportChip({ children }: { children: string }) {
  return <span className="inline-flex items-center rounded-pill border border-line bg-surface-2 px-3 py-1 type-caption whitespace-nowrap text-fg-2">{children}</span>;
}

/** Competition venues: a short list, six to a page. */
export function VenuesTable({ rows, labels }: { rows: VenueRow[]; labels: Labels }) {
  const [page, setPage] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pageCount = Math.ceil(rows.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const visible = rows.slice(start, start + PAGE_SIZE);

  const go = (next: number) => {
    setPage(next);
    const heading = headingRef.current;
    if (heading && heading.getBoundingClientRect().top < 0) heading.scrollIntoView({ block: "start" });
  };

  return (
    <div className="mt-8 flex flex-col gap-4">
      <h3 ref={headingRef} id="competition-venues-title" className="m-0 type-heading-m scroll-mt-header-lg">
        {labels.title}
      </h3>

      <ul aria-labelledby="competition-venues-title" className="m-0 flex list-none flex-col divide-y divide-line overflow-hidden rounded-sm border border-line p-0 tablet:hidden">
        {visible.map((row) => (
          <li key={row.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="type-label">{row.name}</span>
              <span className="flex flex-wrap items-center gap-2">
                <SportChip>{row.sport}</SportChip>
                {row.area && <span className="type-caption text-fg-muted">{row.area}</span>}
              </span>
            </div>
            <MapLink row={row} label={labels.openMap} />
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-sm border border-line tablet:block">
        <table className="w-full border-collapse type-body-s" aria-labelledby="competition-venues-title">
          <caption className="sr-only">{labels.caption}</caption>
          <thead>
            <tr className="bg-surface-2 text-left">
              <th scope="col" className="px-4 py-3 type-label">
                {labels.venue}
              </th>
              <th scope="col" className="w-[30%] px-4 py-3 type-label">
                {labels.sports}
              </th>
              <th scope="col" className="w-px px-4 py-3">
                <span className="sr-only">{labels.openMap}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-t border-line transition-colors duration-ui hover:bg-surface-2">
                <th scope="row" className="px-4 py-3 text-left font-normal">
                  <span className="block type-label">{row.name}</span>
                  {row.area && <span className="block type-caption text-fg-muted">{row.area}</span>}
                </th>
                <td className="px-4 py-3">
                  <SportChip>{row.sport}</SportChip>
                </td>
                <td className="px-4 py-1 text-right">
                  <MapLink row={row} label={labels.openMap} className="ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <nav aria-label={labels.pages} className="flex flex-col items-center gap-3 tablet:flex-row tablet:justify-between">
          <p className="m-0 type-caption text-fg-muted" aria-live="polite">
            {fill(labels.showing, { from: start + 1, to: start + visible.length, total: rows.length })}
          </p>
          <ul className="m-0 flex list-none items-center gap-2 p-0">
            <li>
              <button
                type="button"
                onClick={() => go(page - 1)}
                disabled={page === 0}
                aria-label={labels.prevPage}
                title={labels.prevPage}
                className="grid size-touch place-items-center rounded-sm border border-line text-fg-2 transition-colors duration-ui hover:border-line-strong hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
              >
                <Icon name="chevron-left" size={20} />
              </button>
            </li>
            {Array.from({ length: pageCount }, (_, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === page ? "page" : undefined}
                  aria-label={fill(labels.pageN, { n: i + 1 })}
                  className={cn(
                    "grid size-touch place-items-center rounded-sm border type-label tabular transition-colors duration-ui",
                    i === page ? "border-action-primary bg-action-primary text-on-action-primary" : "border-line text-fg-2 hover:border-line-strong hover:bg-surface-2",
                  )}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => go(page + 1)}
                disabled={page === pageCount - 1}
                aria-label={labels.nextPage}
                title={labels.nextPage}
                className="grid size-touch place-items-center rounded-sm border border-line text-fg-2 transition-colors duration-ui hover:border-line-strong hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
              >
                <Icon name="chevron-right" size={20} />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
