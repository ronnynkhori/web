import { notFound } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/icon";
import { ImportForm } from "@/components/registration/import-form";
import { PeopleList } from "@/components/registration/portal/people-list";
import { sports } from "@/data/sports";
import { isLocale, pick } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";
import { delegationContext } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { registrationDemoActive } from "@/lib/registration/data";
import { fillCopy, portalCopy } from "@/lib/registration/portal-copy";
import { quotaUse } from "@/lib/registration/review";
import { summarise } from "@/lib/registration/rules";
import { loadRegistrationRules } from "@/lib/registration/settings";

function Tile({ label, value, href, icon, tone }: { label: string; value: number; href: string; icon: IconName; tone: "dark" | "yellow" | "plain" | "alert" }) {
  return (
    <a
      href={href}
      data-theme={tone === "dark" ? "dark" : undefined}
      className={cn(
        "group flex flex-col justify-between gap-6 rounded-md border p-4 shadow-sm transition-shadow duration-ui hover:shadow-md tablet:p-5",
        tone === "dark" && "border-transparent bg-surface text-fg",
        tone === "yellow" && "border-transparent bg-success text-on-success",
        tone === "plain" && "border-line bg-surface-raised text-fg",
        tone === "alert" && "border-line-accent bg-warning text-on-warning",
      )}
    >
      <span className="flex items-center justify-between">
        <Icon name={icon} size={20} />
        <Icon name="arrow-right" size={16} className="nudge opacity-60" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-display text-5xl leading-none tabular">{value}</span>
        <span className="type-label">{label}</span>
      </span>
    </a>
  );
}

export default async function DelegationHome({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ saved?: string; submitted?: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  const [{ session, delegation, people, notices, writable }, rules, demo] = await Promise.all([delegationContext(locale), loadRegistrationRules(), registrationDemoActive()]);
  const summary = summarise(people);
  const sportName = (id: string) => (id ? pick(sports.find((sport) => sport.id === id)?.name ?? { en: id, pt: id }, locale) : "");
  const base = `/${locale}/delegation`;
  const estimate = delegation ? delegation.estimatedAthletes + delegation.estimatedOfficials : 0;
  const registered = summary.athletes + summary.officials;
  const usage = quotaUse(people, session.countryCode, rules);
  const recent = [...people].sort((a, b) => (b._updatedAt ?? "").localeCompare(a._updatedAt ?? "")).slice(0, 6);

  const steps: { title: string; help: string; href?: string; tone: "todo" | "warn" | "done" }[] = [];
  if (!delegation) steps.push({ title: p.stepProfile, help: p.stepProfileHelp, href: `${base}/profile`, tone: "todo" });
  if (summary.correction) steps.push({ title: fillCopy(p.stepCorrections, { n: summary.correction }), help: p.stepCorrectionsHelp, href: `${base}/participants?status=correction`, tone: "warn" });
  if (summary.incomplete) steps.push({ title: fillCopy(p.stepDrafts, { n: summary.incomplete }), help: p.stepDraftsHelp, href: `${base}/participants?status=draft`, tone: "todo" });
  if (!steps.length) steps.push({ title: p.stepAllDone, help: p.stepAllDoneHelp, tone: "done" });

  return (
    <div className="container-wide flex flex-col gap-6 py-6 tablet:py-7">
      <header className="flex flex-col gap-4 desktop:flex-row desktop:items-end desktop:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 type-heading-xl">{fillCopy(p.welcome, { name: session.name.split(" ")[0] })}</h1>
          <p className="m-0 max-w-prose type-body-s text-fg-muted">{copy.provisional}</p>
        </div>
        <div className="flex w-full flex-col gap-2 desktop:max-w-sm">
          <span className="flex items-baseline justify-between type-caption text-fg-2">
            <span>{estimate ? fillCopy(p.progressLabel, { n: registered, total: estimate }) : p.progressNone}</span>
            {estimate > 0 && <strong className="tabular text-fg">{Math.min(100, Math.round((registered / estimate) * 100))}%</strong>}
          </span>
          <span className="h-2.5 overflow-hidden rounded-pill bg-surface-overlay">
            <span className="block h-full rounded-pill bg-action-secondary" style={{ width: `${estimate ? Math.min(100, (registered / estimate) * 100) : 0}%` }} />
          </span>
        </div>
      </header>

      {(demo || !writable) && (
        <p className="m-0 flex items-start gap-3 rounded-md border border-line bg-info px-4 py-3 type-body-s text-on-info">
          <Icon name="info" size={20} className="shrink-0" /> {demo ? p.demo : copy.readOnly}
        </p>
      )}
      {(query.saved || query.submitted) && (
        <p role="status" className="m-0 flex items-center gap-3 rounded-md bg-success px-4 py-3 type-body-s font-semibold text-on-success">
          <Icon name="check" size={20} /> {query.submitted ? copy.submitted : copy.saved}
        </p>
      )}

      <section aria-label={p.summary} className="grid grid-cols-2 gap-3 tablet:grid-cols-3 desktop:grid-cols-6">
        <Tile label={copy.athletes} value={summary.athletes} href={`${base}/participants?kind=athlete`} icon="star" tone="dark" />
        <Tile label={copy.officials} value={summary.officials} href={`${base}/participants?kind=official`} icon="id" tone="dark" />
        <Tile label={copy.incomplete} value={summary.incomplete} href={`${base}/participants?status=draft`} icon="minus" tone="plain" />
        <Tile label={copy.submittedCount} value={summary.submitted} href={`${base}/participants?status=submitted`} icon="send" tone="plain" />
        <Tile label={copy.approved} value={summary.approved} href={`${base}/participants?status=approved`} icon="check" tone="yellow" />
        <Tile label={copy.correction} value={summary.correction} href={`${base}/participants?status=correction`} icon="alert" tone={summary.correction ? "alert" : "plain"} />
      </section>

      <div className="grid items-start gap-6 desktop:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h2 className="m-0 type-heading-s">{p.nextSteps}</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {steps.map((step) => {
                const body = (
                  <>
                    <span className={cn("grid size-[2.5rem] shrink-0 place-items-center rounded-pill", step.tone === "warn" ? "bg-warning text-on-warning" : step.tone === "done" ? "bg-success text-on-success" : "bg-surface-inverse text-fg-on-inverse")}>
                      <Icon name={step.tone === "warn" ? "alert" : step.tone === "done" ? "check" : "arrow-right"} size={20} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="type-body-m font-semibold text-fg">{step.title}</span>
                      <span className="type-body-s text-fg-muted">{step.help}</span>
                    </span>
                    {step.href && <Icon name="chevron-right" size={20} className="text-fg-muted" />}
                  </>
                );
                return (
                  <li key={step.title}>
                    {step.href ? (
                      <a href={step.href} className="flex items-center gap-4 rounded-md border border-line bg-surface-raised p-4 shadow-sm transition-shadow duration-ui hover:shadow-md">
                        {body}
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 rounded-md border border-line bg-surface-raised p-4">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-3">
              <h2 className="m-0 type-heading-s">{p.people}</h2>
              {people.length > 0 && (
                <a href={`${base}/participants`} className="inline-flex items-center gap-1 type-label text-link">
                  {p.allPeople} ({people.length}) <Icon name="arrow-right" size={16} />
                </a>
              )}
            </div>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line-strong bg-surface-raised px-6 py-7 text-center">
                <Icon name="list" size={32} className="text-fg-muted" />
                <p className="m-0 type-heading-s">{p.emptyTitle}</p>
                <p className="m-0 max-w-sm type-body-s text-fg-muted">{p.emptyHelp}</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <a href={`${base}/participants/new?kind=athlete`} className="hover-overlay press inline-flex min-h-touch items-center gap-2 rounded-xs bg-action-secondary px-4 type-label text-on-action-secondary">
                    {p.addAthlete}
                  </a>
                  <a href={`${base}/participants/new?kind=official`} className="inline-flex min-h-touch items-center gap-2 rounded-xs border-2 border-action-ghost-border px-4 type-label text-fg">
                    {p.addOfficial}
                  </a>
                </div>
              </div>
            ) : (
              <PeopleList people={recent} locale={locale} sportName={sportName} />
            )}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="m-0 type-heading-s">{copy.bySport}</h2>
            {usage.length === 0 ? (
              <p className="m-0 type-body-s text-fg-muted">{copy.none}</p>
            ) : (
              <ul className="m-0 grid list-none gap-3 p-0 tablet:grid-cols-2">
                {usage.map((row) => {
                  const athletes = row.used.men + row.used.women;
                  const limit = row.quota ? row.quota.men + row.quota.women : 0;
                  const staff = row.used.staff + row.used.judges;
                  const staffLimit = row.quota ? row.quota.staff + row.quota.judges : 0;
                  const bar = (used: number, max: number) => (
                    <span className="h-1.5 overflow-hidden rounded-pill bg-surface-overlay">
                      <span className={cn("block h-full rounded-pill", used > max ? "bg-error" : "bg-surface-inverse")} style={{ width: `${max ? Math.min(100, (used / max) * 100) : 0}%` }} />
                    </span>
                  );
                  return (
                    <li key={row.sportId} className="flex flex-col gap-3 rounded-md border border-line bg-surface-raised p-4 shadow-sm">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="type-body-m font-semibold">{sportName(row.sportId)}</span>
                        <span className="type-caption text-fg-muted">{p.quota}</span>
                      </span>
                      <span className="grid grid-cols-[6rem_1fr_auto] items-center gap-3 type-caption">
                        <span className="text-fg-2">{copy.athletes}</span>
                        {bar(athletes, limit)}
                        <span className="tabular font-semibold">{fillCopy(p.ofQuota, { used: athletes, limit: limit || "—" })}</span>
                        <span className="text-fg-2">{copy.officials}</span>
                        {bar(staff, staffLimit)}
                        <span className="tabular font-semibold">{fillCopy(p.ofQuota, { used: staff, limit: staffLimit || "—" })}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="flex flex-col gap-4 rounded-md border border-line bg-surface-raised p-5 shadow-sm">
            <span className="flex items-center gap-3">
              <span className="grid size-[2.5rem] place-items-center rounded-sm bg-success text-on-success">
                <Icon name="download" size={20} />
              </span>
              <h2 className="m-0 type-heading-s">{copy.importTitle}</h2>
            </span>
            <ImportForm locale={locale} />
          </section>

          <section className="flex flex-col gap-3 rounded-md border border-line bg-surface-raised p-5 shadow-sm">
            <h2 className="m-0 flex items-center gap-2 type-heading-s">
              <Icon name="mail" size={20} /> {copy.notices}
            </h2>
            {notices.length === 0 ? (
              <p className="m-0 type-body-s text-fg-muted">{p.noticesEmpty}</p>
            ) : (
              <ol className="m-0 flex list-none flex-col gap-4 border-l-2 border-line p-0 pl-4">
                {[...notices]
                  .sort((a, b) => (b._updatedAt ?? "").localeCompare(a._updatedAt ?? ""))
                  .slice(0, 8)
                  .map((notice) => (
                    <li key={notice.id} className="relative flex flex-col gap-1">
                      <span aria-hidden="true" className={cn("absolute top-1.5 -left-[1.4rem] size-2.5 rounded-pill", notice.kind === "approved" ? "bg-success" : notice.kind === "submitted" ? "bg-info" : "bg-warning")} />
                      <a href={`${base}/participants/${notice.participantId}`} className="type-body-s font-semibold text-fg hover:text-link">
                        {copy.noticeLine(notice.participantName, notice.kind)}
                      </a>
                      {notice.note && <span className="type-body-s text-fg-2">“{notice.note}”</span>}
                      <span className="type-caption text-fg-muted">{notice.emailed ? copy.noticeSent : copy.noticePending}</span>
                    </li>
                  ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
