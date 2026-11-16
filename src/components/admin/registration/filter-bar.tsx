"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useT } from "../i18n";
import { Button } from "../ui/button";

const select = "h-11 rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:h-9";

/** Search box plus country, sport and role filters. Changing a menu applies it straight away. */
export function FilterBar({
  values,
  countries,
  sports,
  status,
  clearHref,
}: {
  values: { q: string; country: string; sport: string; kind: string };
  countries: { value: string; label: string }[];
  sports: { value: string; label: string }[];
  status: string;
  clearHref?: string;
}) {
  const t = useT();
  const form = useRef<HTMLFormElement>(null);
  const submit = () => form.current?.requestSubmit();
  return (
    <form ref={form} role="search" className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
      {status && <input type="hidden" name="status" value={status} />}
      <label className="relative flex-1 md:max-w-xs">
        <span className="sr-only">{t("Search by name, passport or registration number")}</span>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input type="search" name="q" defaultValue={values.q} placeholder={t("Name, passport or number")} className={`${select} w-full pl-9`} />
      </label>
      <div className="grid grid-cols-2 gap-2 md:flex">
        <select name="country" defaultValue={values.country} onChange={submit} aria-label={t("Country")} className={select}>
          <option value="">{t("All countries")}</option>
          {countries.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select name="sport" defaultValue={values.sport} onChange={submit} aria-label={t("Sport")} className={select}>
          <option value="">{t("All sports")}</option>
          {sports.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <select name="kind" defaultValue={values.kind} onChange={submit} aria-label={t("Role")} className={`${select} col-span-2 md:col-span-1`}>
          <option value="">{t("Athletes and officials")}</option>
          <option value="athlete">{t("Athletes")}</option>
          <option value="official">{t("Officials")}</option>
        </select>
      </div>
      <Button type="submit" variant="secondary" className="md:h-9">
        {t("Search")}
      </Button>
      {clearHref && (
        <Button variant="ghost" asChild className="md:h-9">
          <Link href={clearHref}>
            <X /> {t("Clear filters")}
          </Link>
        </Button>
      )}
    </form>
  );
}
