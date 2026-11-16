import "server-only";
import { countries } from "@/data/countries";
import { getSport } from "@/data/sports";
import type { UserDoc } from "@/lib/cms/types";
import type { Locale } from "@/lib/i18n/config";
import { regCopy } from "./copy";
import type { DelegationDoc, ParticipantDoc, ParticipantFileDoc, RegistrationStatus } from "./model";
import { ageIssue, ageOn, duplicateIssue, fieldIssues, fileIssues, isMinor, normaliseDocument, quotaIssue, sportIssue } from "./rules";
import type { RegistrationRulesDoc, SportQuota } from "./settings";

export type CheckState = "pass" | "fail" | "warn" | "info";

export interface ReviewCheck {
  id: "fields" | "documents" | "age" | "quota" | "duplicate" | "sport" | "minor";
  label: string;
  state: CheckState;
  details: string[];
}

/**
 * The automatic checks re-run for the reviewer, so a decision is taken on today's
 * quotas and documents rather than on what was true when the officer submitted.
 */
export function reviewChecks(
  person: ParticipantDoc,
  people: ParticipantDoc[],
  files: ParticipantFileDoc[],
  delegation: DelegationDoc | null,
  rules: RegistrationRulesDoc,
  locale: Locale,
  labels: Record<ReviewCheck["id"], string>,
): ReviewCheck[] {
  const copy = regCopy(locale);
  const text = (issues: ({ code: string } | null)[]) => issues.filter((i): i is NonNullable<typeof i> => Boolean(i)).map((i) => copy.issue(i as never));
  const fields = fieldIssues(person).filter((issue) => issue.code !== "minor");
  const docs = fileIssues(person, files, rules.extraRequired);
  const age = ageIssue(person);
  const quota = quotaIssue(person, people, rules.quotas);
  const duplicate = duplicateIssue(person, people);
  const number = normaliseDocument(person.documentNumber);
  const elsewhere = number
    ? people.filter((other) => other.id !== person.id && other.countryCode !== person.countryCode && other.status !== "rejected" && normaliseDocument(other.documentNumber) === number)
    : [];
  const sport = sportIssue(person, delegation);
  const checks: ReviewCheck[] = [
    { id: "fields", label: labels.fields, state: fields.length ? "fail" : "pass", details: text(fields) },
    { id: "documents", label: labels.documents, state: docs.length ? "fail" : "pass", details: text(docs) },
  ];
  if (person.kind === "athlete") checks.push({ id: "age", label: labels.age, state: age ? "fail" : "pass", details: text([age]) });
  checks.push({ id: "quota", label: labels.quota, state: quota ? "warn" : "pass", details: text([quota]) });
  checks.push({
    id: "duplicate",
    label: labels.duplicate,
    state: duplicate ? "fail" : elsewhere.length ? "warn" : "pass",
    details: [...text([duplicate]), ...elsewhere.map((other) => `${other.fullName} · ${other.countryCode}`)],
  });
  if (person.sportId) checks.push({ id: "sport", label: labels.sport, state: sport ? "warn" : "pass", details: text([sport]) });
  if (isMinor(person.dateOfBirth)) {
    checks.push({ id: "minor", label: labels.minor, state: "info", details: [copy.issue({ code: "minor" })] });
  }
  return checks;
}

export function ageLabel(person: ParticipantDoc): number | null {
  return ageOn(person.dateOfBirth);
}

export interface CountryProgress {
  code: string;
  officer: UserDoc | undefined;
  delegation: DelegationDoc | null;
  total: number;
  athletes: number;
  officials: number;
  byStatus: Record<RegistrationStatus, number>;
  waiting: number;
  estimated: number;
}

const zero = (): Record<RegistrationStatus, number> => ({ draft: 0, submitted: 0, review: 0, correction: 0, approved: 0, rejected: 0 });

export function countryProgress(people: ParticipantDoc[], delegations: DelegationDoc[], users: UserDoc[]): CountryProgress[] {
  return countries.map((country) => {
    const mine = people.filter((person) => person.countryCode === country.code);
    const byStatus = zero();
    for (const person of mine) byStatus[person.status] += 1;
    const delegation = delegations.find((item) => item.countryCode === country.code) ?? null;
    return {
      code: country.code,
      officer: users.find((user) => user.role === "delegation" && user.countryCode === country.code),
      delegation,
      total: mine.length,
      athletes: mine.filter((person) => person.kind === "athlete" && person.status !== "rejected").length,
      officials: mine.filter((person) => person.kind === "official" && person.status !== "rejected").length,
      byStatus,
      waiting: byStatus.submitted + byStatus.review,
      estimated: delegation ? delegation.estimatedAthletes + delegation.estimatedOfficials : 0,
    };
  });
}

export function statusCounts(people: ParticipantDoc[]): Record<RegistrationStatus, number> {
  const counts = zero();
  for (const person of people) counts[person.status] += 1;
  return counts;
}

/** Places used against the quota per sport for one country (rejected records do not count). */
export function quotaUse(people: ParticipantDoc[], countryCode: string, rules: RegistrationRulesDoc) {
  return (
    countryCode
      ? [...new Set(people.filter((p) => p.countryCode === countryCode && p.sportId).map((p) => p.sportId))]
      : []
  ).map((sportId) => {
    const quota: SportQuota | undefined = rules.quotas[sportId] ?? getSport(sportId)?.programme?.quota;
    const mine = people.filter((p) => p.countryCode === countryCode && p.sportId === sportId && p.status !== "rejected");
    return {
      sportId,
      quota,
      used: {
        men: mine.filter((p) => p.kind === "athlete" && p.sex === "male").length,
        women: mine.filter((p) => p.kind === "athlete" && p.sex === "female").length,
        staff: mine.filter((p) => p.kind === "official" && p.function !== "judge").length,
        judges: mine.filter((p) => p.kind === "official" && p.function === "judge").length,
      },
    };
  });
}
