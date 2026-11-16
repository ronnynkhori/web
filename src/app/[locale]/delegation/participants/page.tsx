import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { PeopleList } from "@/components/registration/portal/people-list";
import { inputClass } from "@/components/registration/portal/fields";
import { sports } from "@/data/sports";
import { cn } from "@/lib/cn";
import { isLocale, pick } from "@/lib/i18n/config";
import { delegationContext } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { applyFilter, matchesStatus, readFilter, type StatusFilter } from "@/lib/registration/filter";
import { portalCopy } from "@/lib/registration/portal-copy";

export default async function ParticipantsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const filter = readFilter((name) => {
    const value = query[name];
    return Array.isArray(value) ? value[0] : value;
  });
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  const { people } = await delegationContext(locale);
  const scoped = applyFilter(people, { ...filter, country: "" }, false);
  const shown = scoped.filter((person) => matchesStatus(person, filter.status)).sort((a, b) => (b._updatedAt ?? "").localeCompare(a._updatedAt ?? ""));
  const sportName = (id: string) => (id ? pick(sports.find((sport) => sport.id === id)?.name ?? { en: id, pt: id }, locale) : "");
  const base = `/${locale}/delegation/participants`;
  const href = (status: StatusFilter) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (filter.kind) params.set("kind", filter.kind);
    if (filter.q) params.set("q", filter.q);
    const text = params.toString();
    return text ? `${base}?${text}` : base;
  };
  const tabs: { value: StatusFilter; label: string }[] = [
    { value: "", label: p.allPeople },
    { value: "draft", label: copy.status.draft },
    { value: "submitted", label: copy.status.submitted },
    { value: "review", label: copy.status.review },
    { value: "correction", label: copy.status.correction },
    { value: "approved", label: copy.status.approved },
    { value: "rejected", label: copy.status.rejected },
  ];

  return (
    <div className="container-wide flex flex-col gap-6 py-6 tablet:py-7">
      <header className="flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:justify-between">
        <h1 className="m-0 type-heading-xl">{p.people}</h1>
        <div className="flex flex-wrap gap-2">
          <a href={`${base}/new?kind=athlete`} className="hover-overlay press inline-flex min-h-touch items-center gap-2 rounded-xs bg-action-secondary px-4 type-label text-on-action-secondary">
            <Icon name="star" size={16} /> {p.addAthlete}
          </a>
          <a href={`${base}/new?kind=official`} className="inline-flex min-h-touch items-center gap-2 rounded-xs border-2 border-action-ghost-border px-4 type-label text-fg">
            <Icon name="id" size={16} /> {p.addOfficial}
          </a>
        </div>
      </header>

      <nav aria-label={copy.statusLabel} className="-mx-4 overflow-x-auto px-4 tablet:mx-0 tablet:px-0">
        <ul className="m-0 flex w-max list-none gap-1 rounded-md border border-line bg-surface-raised p-1 shadow-sm">
          {tabs.map((tab) => {
            const count = scoped.filter((person) => matchesStatus(person, tab.value)).length;
            const active = filter.status === tab.value;
            return (
              <li key={tab.value || "all"}>
                <a
                  href={href(tab.value)}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex min-h-touch items-center gap-2 rounded-sm px-3 type-label whitespace-nowrap", active ? "bg-surface-inverse text-fg-on-inverse" : "text-fg-2 hover:bg-surface-2 hover:text-fg")}
                >
                  {tab.label}
                  <span className={cn("rounded-pill px-1.5 type-caption tabular", active ? "bg-action-secondary text-on-action-secondary" : "bg-surface-overlay")}>{count}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <form role="search" className="grid gap-2 tablet:grid-cols-[1fr_14rem_auto]">
        {filter.status && <input type="hidden" name="status" value={filter.status} />}
        <label className="relative">
          <span className="sr-only">{p.search}</span>
          <Icon name="search" size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-muted" />
          <input type="search" name="q" defaultValue={filter.q} placeholder={p.search} className={cn(inputClass, "pl-[2.25rem]")} />
        </label>
        <select name="kind" defaultValue={filter.kind} aria-label={copy.kind} className={inputClass}>
          <option value="">{copy.athletes} + {copy.officials}</option>
          <option value="athlete">{copy.athletes}</option>
          <option value="official">{copy.officials}</option>
        </select>
        <button type="submit" className="hover-overlay press inline-flex min-h-touch items-center justify-center gap-2 rounded-xs bg-surface-inverse px-5 type-label text-fg-on-inverse">
          <Icon name="search" size={16} /> {p.search.split(" ")[0]}
        </button>
      </form>

      {shown.length === 0 ? (
        <p className="m-0 rounded-md border border-dashed border-line-strong bg-surface-raised px-6 py-7 text-center type-body-s text-fg-muted">{people.length ? p.noMatch : p.emptyHelp}</p>
      ) : (
        <PeopleList people={shown} locale={locale} sportName={sportName} />
      )}
    </div>
  );
}
