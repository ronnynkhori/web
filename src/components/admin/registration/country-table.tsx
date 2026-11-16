import Link from "next/link";
import { ChevronRight, CircleCheck, CircleDashed, UserPlus } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Translate } from "@/lib/admin/i18n/translate";
import type { CountryProgress } from "@/lib/registration/review";
import { FlagChip } from "../flag-chip";
import { StatusBadge } from "../status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { countryName } from "./meta";
import { MiniBar } from "./mini-bar";

function Setup({ row, t, canManageUsers }: { row: CountryProgress; t: Translate; canManageUsers: boolean }) {
  return (
    <span className="flex flex-col gap-1 text-xs">
      <span className="flex items-center gap-1.5">
        {row.officer ? <CircleCheck className="size-3.5 text-success-foreground" aria-hidden="true" /> : <CircleDashed className="size-3.5 text-muted-foreground" aria-hidden="true" />}
        {row.officer ? (
          <span className="truncate">{row.officer.name}</span>
        ) : canManageUsers ? (
          <Link href={`/admin/users/new?country=${row.code}`} className="relative z-10 inline-flex items-center gap-1 font-semibold text-primary hover:underline">
            <UserPlus className="size-3.5" aria-hidden="true" /> {t("Create officer account")}
          </Link>
        ) : (
          <span className="text-muted-foreground">{t("No officer account")}</span>
        )}
      </span>
      <span className="flex items-center gap-1.5">
        {row.delegation ? <CircleCheck className="size-3.5 text-success-foreground" aria-hidden="true" /> : <CircleDashed className="size-3.5 text-muted-foreground" aria-hidden="true" />}
        <span className={row.delegation ? "" : "text-muted-foreground"}>{row.delegation ? t("Delegation profile complete") : t("Profile not filled in")}</span>
      </span>
    </span>
  );
}

/** One row per CPLP country: setup, entries against the estimate, and where the records are in the flow. */
export function CountryTable({ rows, locale, t, canManageUsers }: { rows: CountryProgress[]; locale: Locale; t: Translate; canManageUsers: boolean }) {
  return (
    <>
      <ul className="flex flex-col divide-y overflow-hidden rounded-xl border bg-card md:hidden">
        {rows.map((row) => (
          <li key={row.code} className="relative flex flex-col gap-3 px-4 py-3.5">
            <Link href={`/admin/delegations/${row.code}`} className="flex items-center gap-3 after:absolute after:inset-0">
              <FlagChip code={row.code} size="md" />
              <span className="flex-1 font-semibold">{countryName(row.code, locale)}</span>
              {row.waiting > 0 && <StatusBadge tone="info">{t("{n} waiting", { n: row.waiting })}</StatusBadge>}
              <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
            </Link>
            <Setup row={row} t={t} canManageUsers={canManageUsers} />
            <span className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="tabular-nums">
                {t("{a} athletes · {o} officials", { a: row.athletes, o: row.officials })}
                {row.estimated > 0 && ` · ${t("estimate {n}", { n: row.estimated })}`}
              </span>
            </span>
            <MiniBar counts={row.byStatus} />
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              <TableHead className="h-11 pl-5">{t("Country")}</TableHead>
              <TableHead className="h-11">{t("Set-up")}</TableHead>
              <TableHead className="h-11 text-right">{t("Athletes")}</TableHead>
              <TableHead className="h-11 text-right">{t("Officials")}</TableHead>
              <TableHead className="h-11 w-[22%]">{t("Progress")}</TableHead>
              <TableHead className="h-11 text-right">{t("Waiting")}</TableHead>
              <TableHead className="h-11 pr-5 text-right">{t("Approved")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.code} className="group relative">
                <TableCell className="py-3 pl-5">
                  <Link href={`/admin/delegations/${row.code}`} className="flex items-center gap-3 font-semibold group-hover:text-primary after:absolute after:inset-0">
                    <FlagChip code={row.code} size="md" />
                    {countryName(row.code, locale)}
                  </Link>
                </TableCell>
                <TableCell className="py-3">
                  <Setup row={row} t={t} canManageUsers={canManageUsers} />
                </TableCell>
                <TableCell className="py-3 text-right font-semibold tabular-nums">{row.athletes}</TableCell>
                <TableCell className="py-3 text-right font-semibold tabular-nums">{row.officials}</TableCell>
                <TableCell className="py-3">
                  <span className="flex flex-col gap-1">
                    <MiniBar counts={row.byStatus} />
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {row.total === 0 ? t("No entries yet") : t("{n} entries", { n: row.total })}
                      {row.estimated > 0 && ` · ${t("estimate {n}", { n: row.estimated })}`}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="py-3 text-right">{row.waiting > 0 ? <StatusBadge tone="info">{row.waiting}</StatusBadge> : <span className="text-muted-foreground">0</span>}</TableCell>
                <TableCell className="py-3 pr-5 text-right font-semibold tabular-nums">{row.byStatus.approved}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
