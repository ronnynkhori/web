import { event } from "@/data/event";
import { getSport } from "@/data/sports";
import type { DelegationDoc, FileKind, ParticipantDoc, ParticipantFileDoc, RegistrationStatus, Sex } from "./model";

/** Opening day. Age and "minor" are measured on this date. */
export const registrationDay = event.startDate.value;

export type IssueCode =
  | "required"
  | "minor"
  | "guardian-file"
  | "age"
  | "quota"
  | "duplicate"
  | "sport"
  | "file"
  | "locked"
  | "expiry";

export interface Issue {
  code: IssueCode;
  field?: string;
  limit?: number;
  group?: "men" | "women" | "staff" | "judges";
  from?: number;
  to?: number;
  kind?: FileKind;
}

const athleteRequired = [
  "fullName",
  "dateOfBirth",
  "sex",
  "nationality",
  "countryRepresented",
  "documentNumber",
  "documentExpiry",
  "sportId",
  "discipline",
  "ageCategory",
  "competitionCategory",
  "federation",
  "emergencyName",
  "emergencyPhone",
] as const;

const officialRequired = [
  "fullName",
  "dateOfBirth",
  "nationality",
  "countryRepresented",
  "documentNumber",
  "documentExpiry",
  "function",
  "contactPhone",
] as const;

export function ageOn(dob: string, on = registrationDay): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
  const birth = Date.parse(`${dob}T00:00:00Z`);
  const day = Date.parse(`${on}T00:00:00Z`);
  if (Number.isNaN(birth) || Number.isNaN(day)) return null;
  const b = new Date(birth);
  const d = new Date(day);
  let age = d.getUTCFullYear() - b.getUTCFullYear();
  if (d.getUTCMonth() < b.getUTCMonth() || (d.getUTCMonth() === b.getUTCMonth() && d.getUTCDate() < b.getUTCDate())) age -= 1;
  return age;
}

export function isMinor(dob: string): boolean {
  const age = ageOn(dob);
  return age !== null && age < 18;
}

/** Birth-year window written into the provisional eligibility sentence, e.g. 2009 and 2010. */
export function birthYears(eligibility: string | undefined): { from: number; to: number } | null {
  if (!eligibility) return null;
  const years = [...eligibility.matchAll(/\b(?:19|20)\d{2}\b/g)].map((match) => Number(match[0]));
  if (years.length < 2) return null;
  return { from: Math.min(...years), to: Math.max(...years) };
}

export function normaliseDocument(value: string): string {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

export function normaliseSex(value: string): Sex | "" {
  const v = value.trim().toLowerCase();
  if (["f", "female", "feminino", "woman", "w"].includes(v)) return "female";
  if (["m", "male", "masculino", "man"].includes(v)) return "male";
  return "";
}

function missing(person: ParticipantDoc, fields: readonly (keyof ParticipantDoc)[]): Issue[] {
  return fields.filter((field) => String(person[field] ?? "").trim() === "").map((field) => ({ code: "required" as const, field }));
}

export function fieldIssues(person: ParticipantDoc): Issue[] {
  const issues = person.kind === "athlete" ? missing(person, athleteRequired) : missing(person, officialRequired);
  if (person.kind === "official" && person.function === "other" && !person.functionOther.trim()) {
    issues.push({ code: "required", field: "functionOther" });
  }
  if (person.kind === "official" && person.function !== "head" && person.function !== "" && !person.sportId.trim()) {
    // Sport is optional for officials. Head of delegation may have none.
  }
  if (person.documentExpiry && person.documentExpiry < registrationDay) issues.push({ code: "expiry", field: "documentExpiry" });
  if (isMinor(person.dateOfBirth)) {
    if (!person.guardianName.trim()) issues.push({ code: "required", field: "guardianName" });
    if (!person.guardianContact.trim()) issues.push({ code: "required", field: "guardianContact" });
    issues.push({ code: "minor" });
  }
  return issues;
}

export function fileIssues(person: ParticipantDoc, files: ParticipantFileDoc[], extra: FileKind[] = []): Issue[] {
  const kinds = new Set(files.filter((file) => file.participantId === person.id).map((file) => file.kind));
  const issues: Issue[] = [];
  if (!kinds.has("passport")) issues.push({ code: "file", kind: "passport" });
  if (!kinds.has("photo")) issues.push({ code: "file", kind: "photo" });
  if (isMinor(person.dateOfBirth) && !kinds.has("guardian")) issues.push({ code: "guardian-file", kind: "guardian" });
  for (const kind of extra) {
    if (kind !== "guardian" && !kinds.has(kind)) issues.push({ code: "file", kind });
  }
  return issues;
}

export function ageIssue(person: ParticipantDoc): Issue | null {
  if (person.kind !== "athlete" || !person.sportId || !person.dateOfBirth) return null;
  const sport = getSport(person.sportId);
  const band = birthYears(sport?.programme?.eligibility?.en);
  if (!band) return null;
  const year = Number(person.dateOfBirth.slice(0, 4));
  if (year < band.from || year > band.to) return { code: "age", from: band.from, to: band.to, field: "dateOfBirth" };
  return null;
}

export function sportIssue(person: ParticipantDoc, delegation: DelegationDoc | null): Issue | null {
  if (!person.sportId || !delegation || delegation.sports.length === 0) return null;
  if (person.kind === "official" && person.function === "head") return null;
  return delegation.sports.includes(person.sportId) ? null : { code: "sport", field: "sportId" };
}

/** Counts this person against the men / women / staff / judges quota. An override replaces the provisional number. */
export function quotaIssue(person: ParticipantDoc, people: ParticipantDoc[], overrides?: Record<string, { men: number; women: number; staff: number; judges: number }>): Issue | null {
  if (!person.sportId) return null;
  const provisional = getSport(person.sportId)?.programme?.quota;
  const quota = overrides?.[person.sportId] ?? provisional;
  if (!quota) return null;
  const group = person.kind === "athlete" ? (person.sex === "female" ? "women" : person.sex === "male" ? "men" : null) : person.function === "judge" ? "judges" : "staff";
  if (!group) return null;
  const limit = quota[group];
  const used = people.filter((other) => {
    if (other.id === person.id || other.countryCode !== person.countryCode || other.sportId !== person.sportId) return false;
    if (other.status === "rejected") return false;
    if (group === "women") return other.kind === "athlete" && other.sex === "female";
    if (group === "men") return other.kind === "athlete" && other.sex === "male";
    if (group === "judges") return other.kind === "official" && other.function === "judge";
    return other.kind === "official" && other.function !== "judge";
  }).length;
  return used >= limit ? { code: "quota", limit, group } : null;
}

export function duplicateIssue(person: ParticipantDoc, people: ParticipantDoc[]): Issue | null {
  const number = normaliseDocument(person.documentNumber);
  if (!number) return null;
  const hit = people.some(
    (other) =>
      other.id !== person.id &&
      other.countryCode === person.countryCode &&
      other.status !== "rejected" &&
      normaliseDocument(other.documentNumber) === number,
  );
  return hit ? { code: "duplicate", field: "documentNumber" } : null;
}

/** Everything that must pass before a draft can be submitted. */
export function submitIssues(
  person: ParticipantDoc,
  people: ParticipantDoc[],
  files: ParticipantFileDoc[],
  delegation: DelegationDoc | null,
  rules?: { extraRequired?: FileKind[]; quotas?: Record<string, { men: number; women: number; staff: number; judges: number }> },
): Issue[] {
  const minorMarker = fieldIssues(person).filter((issue) => issue.code !== "minor");
  return [
    ...minorMarker,
    ...fileIssues(person, files, rules?.extraRequired),
    ...[ageIssue(person), sportIssue(person, delegation), quotaIssue(person, people, rules?.quotas), duplicateIssue(person, people)].filter((issue): issue is Issue => Boolean(issue)),
  ];
}

export function canEdit(status: RegistrationStatus): boolean {
  return status === "draft" || status === "correction";
}

export function canDecide(from: RegistrationStatus, to: RegistrationStatus): boolean {
  if (from !== "submitted" && from !== "review") return false;
  return to === "review" || to === "correction" || to === "approved" || to === "rejected";
}

export function nextRegistrationNumber(people: ParticipantDoc[], countryCode: string): string {
  const prefix = `CPLP27-${countryCode}-`;
  const seq = people.reduce((max, person) => {
    if (!person.registrationNumber.startsWith(prefix)) return max;
    const n = Number(person.registrationNumber.slice(prefix.length));
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return `${prefix}${String(seq + 1).padStart(4, "0")}`;
}

export interface RegistrationSummary {
  athletes: number;
  officials: number;
  incomplete: number;
  submitted: number;
  approved: number;
  correction: number;
  rejected: number;
  bySport: { sportId: string; count: number }[];
}

export function summarise(people: ParticipantDoc[]): RegistrationSummary {
  const bySport = new Map<string, number>();
  for (const person of people) {
    if (!person.sportId || person.status === "rejected") continue;
    bySport.set(person.sportId, (bySport.get(person.sportId) ?? 0) + 1);
  }
  return {
    athletes: people.filter((p) => p.kind === "athlete" && p.status !== "rejected").length,
    officials: people.filter((p) => p.kind === "official" && p.status !== "rejected").length,
    incomplete: people.filter((p) => p.status === "draft").length,
    submitted: people.filter((p) => p.status === "submitted" || p.status === "review").length,
    approved: people.filter((p) => p.status === "approved").length,
    correction: people.filter((p) => p.status === "correction").length,
    rejected: people.filter((p) => p.status === "rejected").length,
    bySport: [...bySport.entries()].map(([sportId, count]) => ({ sportId, count })).sort((a, b) => b.count - a.count),
  };
}
