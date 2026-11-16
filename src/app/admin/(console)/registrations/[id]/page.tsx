import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, CircleAlert, CircleCheck, CircleX, Download, FileText, Info, ShieldCheck, TriangleAlert } from "lucide-react";
import { FlagChip } from "@/components/admin/flag-chip";
import { Flash } from "@/components/admin/flash";
import { MobileBarSpacer, PageHeader } from "@/components/admin/page-header";
import { DecisionPanel } from "@/components/admin/registration/decision-panel";
import { byQueue, countryName, isWaiting, sportName, statusLabel, statusTone } from "@/components/admin/registration/meta";
import { StatusBadge } from "@/components/admin/status-badge";
import { initials, relativeTime, shortName, stampFormatFor } from "@/components/admin/time";
import { Alert, AlertDescription, AlertTitle } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { requireUser } from "@/lib/admin/auth";
import { getAdminLocale } from "@/lib/admin/i18n/server";
import { translator } from "@/lib/admin/i18n/translate";
import { regCopy } from "@/lib/registration/copy";
import { loadDelegation, loadFiles, loadNotices, loadParticipants, registrationDemoActive } from "@/lib/registration/data";
import { isDemoId } from "@/lib/registration/demo";
import { fileKinds, type FileKind } from "@/lib/registration/model";
import { reviewChecks, type CheckState } from "@/lib/registration/review";
import { ageOn, decisionsFor, isMinor } from "@/lib/registration/rules";
import { loadRegistrationRules } from "@/lib/registration/settings";
import { getStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const checkIcon: Record<CheckState, ReactNode> = {
  pass: <CircleCheck className="size-5 text-success-foreground" aria-hidden="true" />,
  fail: <CircleX className="size-5 text-primary" aria-hidden="true" />,
  warn: <TriangleAlert className="size-5 text-warning-foreground" aria-hidden="true" />,
  info: <Info className="size-5 text-muted-foreground" aria-hidden="true" />,
};

function Fields({ rows }: { rows: [string, ReactNode][] }) {
  const shown = rows.filter(([, value]) => value !== "" && value !== null && value !== undefined);
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {shown.map(([label, value]) => (
        <div key={label} className="flex min-w-0 flex-col gap-0.5">
          <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
          <dd className="text-sm font-medium break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex items-center justify-between border-b py-3.5 [.border-b]:pb-3.5">
        <CardTitle className="text-sm">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="py-5">{children}</CardContent>
    </Card>
  );
}

export default async function RegistrationDetailPage({ params, searchParams }: PageProps<"/admin/registrations/[id]">) {
  await requireUser("registrations");
  const { id } = await params;
  const query = await searchParams;
  const locale = await getAdminLocale();
  const t = translator(locale);
  const copy = regCopy(locale);
  const [people, allFiles, notices, rules, demo] = await Promise.all([loadParticipants(), loadFiles(), loadNotices(), loadRegistrationRules(), registrationDemoActive()]);
  const person = people.find((item) => item.id === id);
  if (!person) notFound();
  const delegation = await loadDelegation(person.countryCode);
  const files = allFiles.filter((file) => file.participantId === person.id);
  const store = getStore();
  const history = (await store.listAudit(500).catch(() => [])).filter((entry) => entry.itemId === person.id);
  const stamp = stampFormatFor(locale);

  const queue = people.filter((item) => isWaiting(item.status)).sort(byQueue);
  const position = queue.findIndex((item) => item.id === person.id);
  const prev = position > 0 ? queue[position - 1] : undefined;
  const next = position >= 0 ? queue[position + 1] : queue[0]?.id !== person.id ? queue[0] : undefined;

  const checks = reviewChecks(person, people, allFiles, delegation, rules, locale, {
    fields: t("Mandatory fields"),
    documents: t("Required documents"),
    age: t("Age eligibility"),
    quota: t("Country quota"),
    duplicate: t("Duplicate check"),
    sport: t("Sport entered by the delegation"),
    minor: t("Minor: safeguarding"),
  });
  const problems = checks.filter((check) => check.state === "fail" || check.state === "warn").length;
  const options = decisionsFor(person.status);
  const age = ageOn(person.dateOfBirth);
  const minor = isMinor(person.dateOfBirth);
  const photo = files.find((file) => file.kind === "photo" && file.contentType.startsWith("image/") && !isDemoId(file.id));
  const required: FileKind[] = ["passport", "photo", ...(minor ? (["guardian"] as const) : []), ...rules.extraRequired];
  const country = countryName(person.countryCode, locale);
  const sport = sportName(person.sportId, locale);

  const timeline = [
    ...(person.submittedAt ? [{ at: person.submittedAt, text: t("Submitted by the delegation"), who: "" }] : []),
    ...history.map((entry) => ({ at: entry.at, text: t(entry.action), who: shortName(entry.actor, t) })),
    ...notices.filter((notice) => notice.participantId === person.id).map((notice) => ({ at: notice._updatedAt ?? "", text: `${t("Notice to the delegation")}: ${copy.status[notice.kind === "submitted" ? "submitted" : notice.kind]}${notice.emailed ? ` · ${t("emailed")}` : ` · ${t("not emailed")}`}`, who: "" })),
  ]
    .filter((item) => item.at)
    .sort((a, b) => b.at.localeCompare(a.at));

  return (
    <>
      <Flash param="decided" message={query.decided ? t("Decision saved: {status}.", { status: t(statusLabel[String(query.decided) as keyof typeof statusLabel] ?? "") }) : null} />
      <PageHeader
        title={person.fullName || t("Registration")}
        back={{ href: "/admin/registrations", label: t("Registrations") }}
        meta={
          <>
            <StatusBadge tone={statusTone[person.status]}>{t(statusLabel[person.status])}</StatusBadge>
            <StatusBadge tone="neutral">{person.kind === "athlete" ? t("Athlete") : t("Official")}</StatusBadge>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
              <FlagChip code={person.countryCode} /> {country}
            </span>
            {sport && <span className="text-sm text-muted-foreground">· {sport}</span>}
            {minor && <StatusBadge tone="warning">{t("Minor")}</StatusBadge>}
            {person.registrationNumber && <span className="rounded-md bg-sidebar px-2 py-0.5 font-mono text-xs font-semibold text-sidebar-foreground">{person.registrationNumber}</span>}
          </>
        }
        actions={
          queue.length > 0 && (
            <nav aria-label={t("Review queue")} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {position >= 0 ? t("{n} of {total} waiting", { n: position + 1, total: queue.length }) : t("{total} waiting", { total: queue.length })}
              </span>
              <Button variant="outline" size="icon" asChild={Boolean(prev)} disabled={!prev} aria-label={t("Previous in queue")}>
                {prev ? (
                  <Link href={`/admin/registrations/${prev.id}`}>
                    <ChevronLeft />
                  </Link>
                ) : (
                  <ChevronLeft />
                )}
              </Button>
              <Button variant="outline" size="icon" asChild={Boolean(next)} disabled={!next} aria-label={t("Next in queue")}>
                {next ? (
                  <Link href={`/admin/registrations/${next.id}`}>
                    <ChevronRight />
                  </Link>
                ) : (
                  <ChevronRight />
                )}
              </Button>
            </nav>
          )
        }
      />

      {demo && (
        <Alert className="mb-6 border-info-foreground/20 bg-info">
          <Info />
          <AlertTitle>{t("Demonstration record")}</AlertTitle>
          <AlertDescription>{t("Sample data shown because no database is connected. Nothing here is a real person.")}</AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="flex-row items-center gap-4 px-4 md:px-6">
            <span className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-secondary font-display text-3xl text-primary ring-1 ring-border md:size-28">
              {photo ? (
                // Private file: served through the authenticated route, so next/image cannot optimise it.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/registration/file/${photo.id}`} alt={t("Photograph of {name}", { name: person.fullName })} className="size-full object-cover" />
              ) : (
                initials(person.fullName || "?")
              )}
            </span>
            <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">{copy.dateOfBirth}</dt>
                <dd className="text-sm font-semibold">{person.dateOfBirth || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Age on 25 March 2027")}</dt>
                <dd className="text-sm font-semibold">{age ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{copy.documentNumber}</dt>
                <dd className="truncate font-mono text-sm font-semibold">{person.documentNumber || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Submitted")}</dt>
                <dd className="text-sm font-semibold">{person.submittedAt ? relativeTime(person.submittedAt, t) : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Last decision")}</dt>
                <dd className="text-sm font-semibold">{person.decidedAt ? relativeTime(person.decidedAt, t) : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">{t("Delegation")}</dt>
                <dd className="text-sm font-semibold">
                  <Link href={`/admin/delegations/${person.countryCode}`} className="text-primary hover:underline">
                    {delegation?.institution ? t("Open profile") : t("No profile yet")}
                  </Link>
                </dd>
              </div>
            </dl>
          </Card>

          {person.reviewNote && (
            <Alert className={cn(person.status === "rejected" ? "border-primary/30 bg-secondary" : "border-highlight bg-warning text-warning-foreground")}>
              <CircleAlert />
              <AlertTitle>{t("Last note to the delegation")}</AlertTitle>
              <AlertDescription className="text-inherit">{person.reviewNote}</AlertDescription>
            </Alert>
          )}

          <Section title={t("Personal information")}>
            <Fields
              rows={[
                [copy.fullName, person.fullName],
                [copy.sex, person.sex ? copy[person.sex] : ""],
                [copy.nationality, person.nationality],
                [copy.countryRepresented, country],
                [copy.documentNumber, person.documentNumber],
                [copy.documentExpiry, person.documentExpiry],
              ]}
            />
          </Section>

          {person.kind === "athlete" ? (
            <Section title={t("Sporting information")}>
              <Fields
                rows={[
                  [copy.sport, sport],
                  [copy.discipline, person.discipline],
                  [copy.ageCategory, person.ageCategory],
                  [copy.competitionCategory, person.competitionCategory],
                  [copy.federation, person.federation],
                  [copy.club, person.club],
                  [copy.jersey, person.jerseyNumber],
                  [copy.sportNotes, person.sportNotes],
                ]}
              />
            </Section>
          ) : (
            <Section title={t("Function")}>
              <Fields
                rows={[
                  [copy.function, person.function ? copy.functions[person.function] : ""],
                  [copy.functionOther, person.functionOther],
                  [copy.sport, sport || t("Whole delegation")],
                ]}
              />
            </Section>
          )}

          <Section title={t("Contacts and safeguarding")}>
            <Fields
              rows={[
                [copy.contactEmail, person.contactEmail],
                [copy.contactPhone, person.contactPhone],
                [copy.emergencyName, person.emergencyName],
                [copy.emergencyPhone, person.emergencyPhone],
                [copy.guardianName, person.guardianName],
                [copy.guardianContact, person.guardianContact],
                [copy.accessibility, person.accessibility],
              ]}
            />
          </Section>

          <Section title={copy.documents}>
            <ul className="flex flex-col divide-y rounded-lg border">
              {fileKinds
                .filter((kind) => required.includes(kind) || files.some((file) => file.kind === kind))
                .map((kind) => {
                  const file = files.find((item) => item.kind === kind);
                  const demoFile = file && isDemoId(file.id);
                  return (
                    <li key={kind} className="flex items-center gap-3 px-3 py-2.5">
                      <FileText className={cn("size-5 shrink-0", file ? "text-foreground" : "text-muted-foreground/50")} aria-hidden="true" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-medium">
                          {copy.files[kind]}
                          {required.includes(kind) && <span className="ml-1 text-xs font-normal text-muted-foreground">· {t("required")}</span>}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {file ? `${file.filename} · ${Math.max(1, Math.round(file.size / 1024))} KB` : t("Not uploaded")}
                        </span>
                      </span>
                      {file && !demoFile ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/api/registration/file/${file.id}`} target="_blank" rel="noopener">
                            <Download /> {t("Open")}
                          </a>
                        </Button>
                      ) : file ? (
                        <StatusBadge tone="neutral">{t("Sample")}</StatusBadge>
                      ) : (
                        <StatusBadge tone={required.includes(kind) ? "error" : "neutral"}>{t("Missing")}</StatusBadge>
                      )}
                    </li>
                  );
                })}
            </ul>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" aria-hidden="true" />
              {t("Documents are private. Only the Committee and this country's officer can open them, and every link checks the sign-in.")}
            </p>
          </Section>

          <Section title={t("History")}>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("Nothing recorded yet.")}</p>
            ) : (
              <ol className="relative flex flex-col gap-4 border-l pl-5">
                {timeline.map((item, index) => (
                  <li key={`${item.at}-${index}`} className="relative">
                    <span aria-hidden="true" className="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-primary ring-4 ring-card" />
                    <p className="text-sm">
                      {item.who && <strong className="font-semibold">{item.who} </strong>}
                      {item.text}
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">{stamp.format(new Date(item.at))}</p>
                  </li>
                ))}
              </ol>
            )}
          </Section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <Section title={t("Automatic checks")} action={<StatusBadge tone={problems ? "warning" : "success"}>{problems ? t("{n} to look at", { n: problems }) : t("All passed")}</StatusBadge>}>
            <ul className="flex flex-col gap-3">
              {checks.map((check) => (
                <li key={check.id} className="flex gap-2.5">
                  {checkIcon[check.state]}
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-medium">{check.label}</span>
                    {check.details.map((detail) => (
                      <span key={detail} className="text-xs text-muted-foreground">
                        {detail}
                      </span>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title={options.length && !(person.status === "approved" || person.status === "rejected") ? t("Decision") : t("Status")}>
            {person.status === "approved" && (
              <div className="mb-4 flex flex-col gap-1 rounded-lg bg-sidebar p-4 text-sidebar-foreground">
                <span className="text-xs font-semibold tracking-wider text-sidebar-foreground/70 uppercase">{copy.registrationNumber}</span>
                <span className="font-mono text-xl font-bold">{person.registrationNumber}</span>
                <span className="text-xs text-sidebar-foreground/75">{t("Kept for accreditation with the photograph. The officer can print the QR credential record.")}</span>
              </div>
            )}
            {person.status === "draft" && <p className="text-sm text-muted-foreground">{t("The officer has not submitted this record yet. There is nothing to decide.")}</p>}
            {person.status === "correction" && <p className="text-sm text-muted-foreground">{t("Sent back to the officer. It returns to the queue when they submit it again.")}</p>}
            {options.length > 0 && (
              <DecisionPanel
                key={person.status}
                id={person.id}
                status={person.status}
                options={options}
                nextId={next && next.id !== person.id ? next.id : undefined}
                readOnly={!store.writable}
                hasProblems={problems > 0}
              />
            )}
          </Section>
        </aside>
      </div>
      <MobileBarSpacer />
    </>
  );
}
