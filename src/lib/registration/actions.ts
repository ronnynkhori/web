"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, requireUser } from "@/lib/admin/auth";
import { audit } from "@/lib/admin/mutate";
import { SESSION_COOKIE } from "@/lib/admin/session";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { getStore } from "@/lib/store";
import { regCopy } from "./copy";
import { freshId, loadDelegation, loadFiles, loadNotices, loadParticipants, saveDelegation, saveFile, saveNotice, saveParticipant } from "./data";
import { readAthleteRows, rowToAthlete } from "./excel";
import { acceptUpload, writePrivateFile } from "./files";
import { deliverNotice } from "./mail";
import { emptyParticipant, fileKinds, officialFunctions, type DelegationDoc, type OfficialFunction, type ParticipantDoc, type ParticipantKind, type RegistrationStatus } from "./model";
import { canDecide, canEdit, nextRegistrationNumber, normaliseSex, submitIssues, type Issue } from "./rules";

export interface FormState {
  errors: string[];
  message: string;
  /** Set when a failed submit still stored the draft, so the form keeps that id. */
  id?: string;
}

function localeOf(form: FormData): Locale {
  const value = String(form.get("locale") ?? "pt");
  return isLocale(value) ? value : "pt";
}

async function officer(locale: Locale) {
  const session = await getSession();
  if (!session || session.role !== "delegation" || !session.countryCode) redirect(`/${locale}/delegation/login`);
  return session;
}

function texts(issues: Issue[], locale: Locale): string[] {
  const copy = regCopy(locale);
  return issues.map((issue) => copy.issue(issue));
}

async function notify(
  input: {
    countryCode: string;
    participantId: string;
    participantName: string;
    emailTo: string;
    kind: "submitted" | "approved" | "correction" | "rejected";
    message: string;
    note?: string;
  },
  actor: string,
) {
  const emailed = await deliverNotice({ ...input, subject: `CPLP 2027 registration: ${input.kind}` });
  await saveNotice(
    {
      id: freshId("notice"),
      countryCode: input.countryCode,
      participantId: input.participantId,
      participantName: input.participantName,
      kind: input.kind,
      message: input.message,
      note: input.note,
      emailTo: input.emailTo,
      emailed,
    },
    actor,
  );
}

function readDelegation(form: FormData, countryCode: string, existing: DelegationDoc | null): DelegationDoc {
  const str = (name: string) => String(form.get(name) ?? "").trim();
  const sports = form.getAll("sports").map(String).filter(Boolean);
  return {
    id: existing?.id ?? freshId("del"),
    countryCode,
    institution: str("institution"),
    headName: str("headName"),
    headPosition: str("headPosition"),
    email: str("email"),
    telephone: str("telephone"),
    officerName: str("officerName"),
    officerContact: str("officerContact"),
    sports,
    estimatedAthletes: Number(str("estimatedAthletes")) || 0,
    estimatedOfficials: Number(str("estimatedOfficials")) || 0,
  };
}

function readParticipant(form: FormData, base: ParticipantDoc): ParticipantDoc {
  const str = (name: string) => String(form.get(name) ?? "").trim();
  const fn = str("function");
  return {
    ...base,
    fullName: str("fullName"),
    dateOfBirth: str("dateOfBirth"),
    sex: normaliseSex(str("sex")),
    nationality: str("nationality"),
    countryRepresented: base.countryCode,
    documentNumber: str("documentNumber"),
    documentExpiry: str("documentExpiry"),
    sportId: str("sportId"),
    discipline: str("discipline"),
    ageCategory: str("ageCategory"),
    competitionCategory: str("competitionCategory"),
    federation: str("federation"),
    club: str("club"),
    jerseyNumber: str("jerseyNumber"),
    emergencyName: str("emergencyName"),
    emergencyPhone: str("emergencyPhone"),
    accessibility: str("accessibility"),
    guardianName: str("guardianName"),
    guardianContact: str("guardianContact"),
    function: officialFunctions.includes(fn as OfficialFunction) ? (fn as OfficialFunction) : "",
    functionOther: str("functionOther"),
    contactEmail: str("contactEmail"),
    contactPhone: str("contactPhone"),
  };
}

async function storeUploads(form: FormData, person: ParticipantDoc, actor: string, locale: Locale): Promise<string[]> {
  const problems: string[] = [];
  const copy = regCopy(locale);
  for (const kind of fileKinds) {
    const value = form.get(kind);
    if (!(value instanceof File) || value.size === 0) continue;
    const accepted = acceptUpload(value, kind);
    if (!accepted.ok) {
      problems.push(`${copy.files[kind]}: ${accepted.reason}`);
      continue;
    }
    const id = freshId("file");
    await writePrivateFile(id, await accepted.bytes, value.type || "application/octet-stream");
    await saveFile(
      {
        id,
        participantId: person.id,
        countryCode: person.countryCode,
        kind,
        filename: value.name,
        contentType: value.type || "application/octet-stream",
        size: value.size,
      },
      actor,
    );
  }
  return problems;
}

export async function saveDelegationProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const locale = localeOf(form);
  const session = await officer(locale);
  if (!getStore().writable) return { errors: [], message: regCopy(locale).readOnly };
  const doc = readDelegation(form, session.countryCode, await loadDelegation(session.countryCode));
  const missing = (["institution", "headName", "email", "telephone", "officerName"] as const).filter((field) => !doc[field]);
  if (missing.length || doc.sports.length === 0) {
    return { errors: texts(missing.map((field) => ({ code: "required" as const, field })), locale), message: "" };
  }
  await saveDelegation(doc, session.email);
  await audit(session, "saved delegation", "delegations", doc.id, session.countryCode);
  redirect(`/${locale}/delegation?saved=1`);
}

export async function saveParticipantForm(_prev: FormState, form: FormData): Promise<FormState> {
  const locale = localeOf(form);
  const session = await officer(locale);
  if (!getStore().writable) return { errors: [], message: regCopy(locale).readOnly };
  const people = await loadParticipants();
  const id = String(form.get("id") ?? "");
  const existing = people.find((person) => person.id === id && person.countryCode === session.countryCode);
  const kind = (String(form.get("kind") ?? existing?.kind ?? "athlete") === "official" ? "official" : "athlete") as ParticipantKind;
  if (existing && !canEdit(existing.status)) return { errors: [regCopy(locale).locked], message: "" };
  const person = readParticipant(form, existing ?? { ...emptyParticipant(session.countryCode, kind), id: freshId("person") });
  person.kind = kind;
  const uploadErrors = await storeUploads(form, person, session.email, locale);
  const intent = String(form.get("intent") ?? "save");
  const files = await loadFiles();
  const delegation = await loadDelegation(session.countryCode);
  if (intent === "submit") {
    const issues = submitIssues(person, people, files, delegation);
    if (issues.length || uploadErrors.length) {
      person.status = existing?.status ?? "draft";
      await saveParticipant(person, session.email);
      return { errors: [...texts(issues, locale), ...uploadErrors], message: "", id: person.id };
    }
    person.status = "submitted";
    person.submittedAt = new Date().toISOString();
  }
  await saveParticipant(person, session.email);
  await audit(session, intent === "submit" ? "submitted registration" : "saved registration", "participants", person.id, person.fullName);
  if (intent === "submit") {
    const delegation = await loadDelegation(session.countryCode);
    await notify(
      {
        countryCode: person.countryCode,
        participantId: person.id,
        participantName: person.fullName,
        emailTo: delegation?.email ?? "",
        kind: "submitted",
        message: regCopy(locale).noticeLine(person.fullName, "submitted"),
      },
      session.email,
    );
  }
  redirect(intent === "submit" ? `/${locale}/delegation?submitted=1` : `/${locale}/delegation/participants/${person.id}?saved=1`);
}

export async function importAthletes(_prev: FormState, form: FormData): Promise<FormState> {
  const locale = localeOf(form);
  const session = await officer(locale);
  const copy = regCopy(locale);
  if (!getStore().writable) return { errors: [], message: copy.readOnly };
  const file = form.get("workbook");
  if (!(file instanceof File) || file.size === 0) return { errors: [copy.importFailed], message: "" };
  const rows = await readAthleteRows(new Uint8Array(await file.arrayBuffer()));
  const people = await loadParticipants();
  const delegation = await loadDelegation(session.countryCode);
  const files = await loadFiles();
  let imported = 0;
  const errors: string[] = [];
  for (const row of rows) {
    const person: ParticipantDoc = { ...emptyParticipant(session.countryCode, "athlete"), ...rowToAthlete(row, session.countryCode), id: freshId("person"), status: "draft" };
    const issues = submitIssues(person, [...people], files, delegation).filter((issue) => issue.code !== "file" && issue.code !== "guardian-file");
    if (issues.length) {
      errors.push(`${person.fullName || "—"}: ${texts(issues, locale).join(" ")}`);
      continue;
    }
    await saveParticipant(person, session.email);
    people.push(person);
    imported += 1;
  }
  await audit(session, "imported athletes", "participants", undefined, String(imported));
  if (!imported) return { errors: errors.length ? errors : [copy.importFailed], message: "" };
  return { errors, message: copy.imported.replace("{n}", String(imported)) };
}

export async function decideRegistration(_prev: FormState, form: FormData): Promise<FormState> {
  const session = await requireUser("registrations");
  if (!getStore().writable) return { errors: [], message: "This deployment has no database, so the decision cannot be saved." };
  const id = String(form.get("id") ?? "");
  const to = String(form.get("status") ?? "") as RegistrationStatus;
  const note = String(form.get("reviewNote") ?? "").trim();
  const people = await loadParticipants();
  const person = people.find((item) => item.id === id);
  if (!person || !canDecide(person.status, to)) return { errors: ["This registration cannot move to that status."], message: "" };
  if ((to === "correction" || to === "rejected") && !note) return { errors: ["Write a note for the delegation."], message: "" };
  person.status = to;
  person.reviewNote = note;
  person.decidedAt = new Date().toISOString();
  if (to === "approved" && !person.registrationNumber) person.registrationNumber = nextRegistrationNumber(people, person.countryCode);
  await saveParticipant(person, session.email);
  await audit(session, `registration ${to}`, "participants", person.id, person.registrationNumber || person.fullName);
  if (to === "approved" || to === "correction" || to === "rejected") {
    const delegation = await loadDelegation(person.countryCode);
    await notify(
      {
        countryCode: person.countryCode,
        participantId: person.id,
        participantName: person.fullName,
        emailTo: delegation?.email || person.contactEmail,
        kind: to,
        message: regCopy("pt").noticeLine(person.fullName, to),
        note: note || undefined,
      },
      session.email,
    );
  }
  redirect("/admin/registrations?saved=1");
}

export async function signOutDelegation(form: FormData): Promise<void> {
  const locale = localeOf(form);
  const session = await getSession();
  (await cookies()).delete(SESSION_COOKIE);
  if (session) {
    try {
      await audit(session, "signed out");
    } catch {
      // The cookie is already cleared.
    }
  }
  redirect(`/${locale}/delegation/login`);
}

export async function delegationContext(locale: Locale) {
  const session = await officer(locale);
  const [delegation, people, files, notices] = await Promise.all([
    loadDelegation(session.countryCode),
    loadParticipants(),
    loadFiles(),
    loadNotices(),
  ]);
  return {
    session,
    delegation,
    people: people.filter((person) => person.countryCode === session.countryCode),
    files: files.filter((file) => file.countryCode === session.countryCode),
    notices: notices.filter((notice) => notice.countryCode === session.countryCode),
    writable: getStore().writable,
  };
}
