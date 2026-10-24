"use server";

import { redirect } from "next/navigation";
import { sports } from "@/data/sports";
import { requireUser } from "@/lib/admin/auth";
import { getAdminCountries, getAdminVenues, getCountryOptions } from "@/lib/admin/countries";
import { getT } from "@/lib/admin/i18n/server";
import type { Translate } from "@/lib/admin/i18n/translate";
import { deleteDoc, deleteDocs, loadItems, newId, saveDoc } from "@/lib/admin/mutate";
import { parseFields } from "@/lib/admin/parse";
import { canApprove } from "@/lib/admin/roles";
import { adjustmentFields, matchFields } from "@/lib/admin/results-fields";
import type { Session } from "@/lib/admin/session";
import type { Approval, EventResultDoc, EventResultRow, MatchDoc, MedalAdjustmentDoc } from "@/lib/cms/types";
import type { Localized } from "@/lib/i18n/config";
import { cleanSet, cleanSets } from "@/lib/live/scoring";
import type { EventStatus, Match, TimelineEvent } from "@/lib/live/types";
import type { BulkResult, FormState } from "./content";

const STATUSES: EventStatus[] = ["upcoming", "live", "finished", "postponed", "cancelled"];
const KINDS = new Set(["goal", "yellow", "red", "point", "period"]);
const same = (text: string): Localized => ({ en: text, pt: text, fr: text });
const int = (v: unknown, max = 999) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));

/** Scorers only touch their assigned sports; a scorer with none assigned can score nothing. */
function assertSport(session: Session, sportId: string, t: Translate) {
  if (session.role === "scorer" && !session.sportIds.includes(sportId)) {
    throw new Error(session.sportIds.length ? t("This sport is not assigned to you.") : t("No sport is assigned to you yet. Ask a Super admin."));
  }
}

const scoreline = (m: Match) =>
  `${m.home.countryCode} ${m.home.score}-${m.away.score} ${m.away.countryCode} (${m.status}${m.minute ? ` ${m.minute}'` : ""})`;

export type ScoreSaveResult =
  | { ok: true; approval: Approval; published: boolean; rev: number }
  | { ok: false; error: string; conflict?: { match: Match; rev: number; by?: string } };

/**
 * Saves the scorer's working copy. Live updates publish straight away; every
 * final score waits in Approvals, even when a results manager enters it. `rev` is the version
 * the desk last saw: if someone else saved since, nothing is written and the
 * desk asks which score to keep (`force` after that choice).
 */
export async function saveMatchScore(id: string, input: Match, rev?: number, force = false): Promise<ScoreSaveResult> {
  const session = await requireUser("scores");
  const t = await getT();
  try {
    const doc = (await loadItems<MatchDoc>("matches")).find((m) => m.id === id);
    if (!doc) return { ok: false, error: t("Match not found. It may have been deleted.") };
    assertSport(session, doc.draft.sportId, t);
    const current = doc.rev ?? 0;
    if (!force && rev !== undefined && rev !== current) {
      return {
        ok: false,
        error: t("Someone else updated this match."),
        conflict: { match: doc.draft, rev: current, by: doc._updatedBy },
      };
    }

    const timeline: TimelineEvent[] = (Array.isArray(input.timeline) ? input.timeline : [])
      .slice(0, 300)
      .filter((e) => KINDS.has(e.kind) && (e.side === "home" || e.side === "away"))
      .map((e) => ({ id: String(e.id).slice(0, 40), minute: int(e.minute, 200), kind: e.kind, side: e.side }));
    const draft: Match = {
      ...doc.draft,
      status: STATUSES.includes(input.status) ? input.status : doc.draft.status,
      minute: input.minute === null ? null : int(input.minute, 200),
      home: { ...doc.draft.home, score: int(input.home?.score) },
      away: { ...doc.draft.away, score: int(input.away?.score) },
      timeline,
      sets: cleanSets(input.sets),
      setPoints: input.setPoints ? cleanSet(input.setPoints) : undefined,
    };

    const approver = canApprove(session.role);
    const wasFinal = doc.published?.status === "finished";
    let next: MatchDoc;
    if (draft.status === "finished" || (wasFinal && !approver)) {
      // Every final score goes through Approvals, whoever enters it; the site keeps the last published score meanwhile.
      next = { ...doc, draft, approval: "pending", submittedBy: session.email, note: undefined };
    } else if (approver) {
      const changedFinal =
        wasFinal && (doc.published!.home.score !== draft.home.score || doc.published!.away.score !== draft.away.score);
      const published = { ...draft, corrected: changedFinal || doc.published?.corrected || undefined };
      next = { ...doc, draft: published, published, approval: "approved", approvedBy: session.email, note: undefined };
    } else {
      next = { ...doc, draft, published: draft, approval: "draft", submittedBy: session.email };
    }
    next.rev = current + 1;
    const action = next.approval === "pending" ? "submitted final score" : force ? "overwrote score after conflict" : "updated score";
    await saveDoc("matches", next, session, action, scoreline(draft));
    return { ok: true, approval: next.approval, published: next.approval !== "pending", rev: next.rev };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : t("Could not save.") };
  }
}

async function parseFixture(form: FormData, t: Translate) {
  const [countryList, venueList] = await Promise.all([getAdminCountries(), getAdminVenues()]);
  const fields = matchFields(
    countryList.map((c) => ({ value: c.code, label: c.name.en })),
    venueList.map((v) => ({ value: v.id, label: v.name.en })),
  );
  const { values, errors } = parseFields(fields, form);
  if (values.home && values.home === values.away) errors.away = t("Choose two different teams.");
  const sport = sports.find((s) => s.id === values.sportId);
  const nameOf = (code: unknown) => countryList.find((c) => c.code === code)?.name ?? same(String(code));
  const venue = venueList.find((v) => v.id === values.venueId);
  return {
    errors,
    fixture: {
      sportId: String(values.sportId),
      sport: sport?.name ?? same(String(values.sportId)),
      round: values.round as Localized,
      startsAt: (values.startsAt as string | undefined) || undefined,
      venue: venue?.name,
      home: { countryCode: String(values.home), name: nameOf(values.home) },
      away: { countryCode: String(values.away), name: nameOf(values.away) },
    },
    venueId: venue?.id,
  };
}

export async function createMatch(_prev: FormState, form: FormData): Promise<FormState> {
  const session = await requireUser("scores");
  const t = await getT();
  if (!canApprove(session.role)) return { message: t("Only results managers can add matches.") };
  const { errors, fixture, venueId } = await parseFixture(form, t);
  if (Object.keys(errors).length) return { errors, message: t("Please fix the highlighted fields.") };

  const match: Match = {
    id: newId("m"),
    ...fixture,
    status: "upcoming",
    minute: null,
    home: { ...fixture.home, score: 0 },
    away: { ...fixture.away, score: 0 },
    timeline: [],
  };
  const doc: MatchDoc = { id: match.id, draft: match, published: match, approval: "approved", venueId };
  try {
    await saveDoc("matches", doc, session, "created match", scoreline(match));
  } catch (error) {
    return { message: error instanceof Error ? error.message : t("Could not save.") };
  }
  redirect(`/admin/scores/${match.id}`);
}

/** Teams, round, start time and venue. Scores and the timeline are kept. */
export async function updateFixture(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const session = await requireUser("scores");
  const t = await getT();
  if (!canApprove(session.role)) return { message: t("Only results managers can change fixtures.") };
  const { errors, fixture, venueId } = await parseFixture(form, t);
  if (Object.keys(errors).length) return { errors, message: t("Please fix the highlighted fields.") };
  try {
    const doc = (await loadItems<MatchDoc>("matches")).find((m) => m.id === id);
    if (!doc) return { message: t("Match not found. It may have been deleted.") };
    const apply = (m: Match): Match => ({
      ...m,
      ...fixture,
      home: { ...fixture.home, score: m.home.score },
      away: { ...fixture.away, score: m.away.score },
    });
    const next: MatchDoc = {
      ...doc,
      venueId,
      draft: apply(doc.draft),
      published: doc.published ? apply(doc.published) : null,
      rev: (doc.rev ?? 0) + 1,
    };
    await saveDoc("matches", next, session, "updated fixture", scoreline(next.draft));
  } catch (error) {
    return { message: error instanceof Error ? error.message : t("Could not save.") };
  }
  redirect(`/admin/scores/${id}?fixture=1`);
}

export async function deleteMatch(id: string): Promise<void> {
  const session = await requireUser("approvals");
  const doc = (await loadItems<MatchDoc>("matches")).find((m) => m.id === id);
  await deleteDoc("matches", id, session, doc ? scoreline(doc.draft) : id);
  redirect("/admin/scores?deleted=1");
}

export async function deleteMatches(ids: string[]): Promise<BulkResult> {
  const session = await requireUser("approvals");
  if (!Array.isArray(ids) || !ids.length) return { count: 0 };
  try {
    const found = (await loadItems<MatchDoc>("matches")).filter((m) => ids.includes(m.id));
    const summary = found.slice(0, 5).map((m) => scoreline(m.draft)).join(", ") + (found.length > 5 ? "…" : "");
    return { count: await deleteDocs("matches", ids.map(String), session, summary) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : (await getT())("Could not delete.") };
  }
}

export interface EventResultInput {
  sportId: string;
  event: Localized;
  medalEvent: boolean;
  rows: EventResultRow[];
  intent: "draft" | "submit" | "publish";
}

export async function saveEventResult(id: string | null, input: EventResultInput): Promise<{ error: string } | void> {
  const session = await requireUser("results");
  const t = await getT();
  if (!sports.some((s) => s.id === input.sportId)) return { error: t("Choose a sport.") };
  if (!input.event?.en?.trim()) return { error: t("Name the event in English, e.g. Athletics · 100 m boys final.") };
  try {
    assertSport(session, input.sportId, t);
  } catch (error) {
    return { error: (error as Error).message };
  }
  const rows: EventResultRow[] = (input.rows ?? []).slice(0, 80).map((r) => ({
    rank: int(r.rank, 99),
    athlete: String(r.athlete ?? "").trim().slice(0, 80),
    countryCode: String(r.countryCode ?? ""),
    result: String(r.result ?? "").trim().slice(0, 40),
    notes: String(r.notes ?? "").trim().slice(0, 80) || undefined,
  }));
  const codes = new Set((await getAdminCountries()).map((c) => c.code));
  const bad = rows.findIndex((r) => !r.rank || !r.athlete || !codes.has(r.countryCode));
  if (bad >= 0) return { error: t("Row {n}: rank, athlete and country are required.", { n: bad + 1 }) };
  if (!rows.length && input.intent !== "draft") return { error: t("Add at least one result row.") };
  if (input.intent === "publish" && !canApprove(session.role)) return { error: t("Only results managers can publish.") };

  const existing = id ? (await loadItems<EventResultDoc>("results")).find((r) => r.id === id) : undefined;
  if (id && !existing) return { error: t("This result no longer exists.") };
  if (existing) {
    try {
      assertSport(session, existing.sportId, t);
    } catch (error) {
      return { error: (error as Error).message };
    }
  }
  const event = {
    en: input.event.en.trim(),
    pt: input.event.pt?.trim() ?? "",
    fr: input.event.fr?.trim() ?? "",
  };
  const meta = { sportId: input.sportId, event, medalEvent: Boolean(input.medalEvent) };
  const base: EventResultDoc = existing ?? {
    id: newId("ev"),
    ...meta,
    draft: [],
    published: null,
    approval: "draft",
  };
  // Sport, event name and medal flag are public as soon as rows are published, so
  // on a published result only approvers change them directly; anyone else proposes.
  const live = Boolean(base.published?.length);
  const direct = !live || canApprove(session.role);
  const doc: EventResultDoc = direct
    ? { ...base, ...meta, pendingMeta: undefined, draft: rows }
    : { ...base, pendingMeta: meta, draft: rows };
  if (input.intent === "publish") {
    const changed = Boolean(base.published?.length) && JSON.stringify(base.published) !== JSON.stringify(rows);
    Object.assign(doc, { published: rows, approval: "approved", approvedBy: session.email, corrected: changed || base.corrected, note: undefined });
  } else if (input.intent === "submit") {
    Object.assign(doc, { approval: "pending", submittedBy: session.email, note: undefined });
  } else if (base.approval !== "approved") {
    doc.approval = "draft";
  }
  try {
    const action = input.intent === "publish" ? "published result" : input.intent === "submit" ? "submitted result" : "saved result draft";
    await saveDoc("results", doc, session, action, event.en);
  } catch (error) {
    return { error: error instanceof Error ? error.message : t("Could not save.") };
  }
  redirect(`/admin/results?saved=${input.intent}`);
}

export async function deleteEventResult(id: string): Promise<void> {
  const session = await requireUser("approvals");
  const doc = (await loadItems<EventResultDoc>("results")).find((r) => r.id === id);
  await deleteDoc("results", id, session, doc?.event.en ?? id);
  redirect("/admin/results?deleted=1");
}

export async function deleteEventResults(ids: string[]): Promise<BulkResult> {
  const session = await requireUser("approvals");
  if (!Array.isArray(ids) || !ids.length) return { count: 0 };
  try {
    const found = (await loadItems<EventResultDoc>("results")).filter((r) => ids.includes(r.id));
    const summary = found.slice(0, 5).map((r) => r.event.en).join(", ") + (found.length > 5 ? "…" : "");
    return { count: await deleteDocs("results", ids.map(String), session, summary) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : (await getT())("Could not delete.") };
  }
}

async function publishMatch(session: Session, doc: MatchDoc): Promise<number> {
  const wasFinal = doc.published?.status === "finished";
  const corrected =
    wasFinal && (doc.published!.home.score !== doc.draft.home.score || doc.published!.away.score !== doc.draft.away.score);
  const published = { ...doc.draft, corrected: corrected || doc.published?.corrected || undefined };
  const rev = (doc.rev ?? 0) + 1;
  await saveDoc(
    "matches",
    { ...doc, draft: published, published, approval: "approved", approvedBy: session.email, note: undefined, rev },
    session,
    "approved",
    scoreline(published),
  );
  return rev;
}

async function publishResult(session: Session, doc: EventResultDoc): Promise<void> {
  const corrected = Boolean(doc.published?.length) && JSON.stringify(doc.published) !== JSON.stringify(doc.draft);
  await saveDoc(
    "results",
    {
      ...doc,
      ...doc.pendingMeta,
      pendingMeta: undefined,
      published: doc.draft,
      approval: "approved",
      approvedBy: session.email,
      corrected: corrected || doc.corrected,
      note: undefined,
    },
    session,
    "approved",
    doc.event.en,
  );
}

export async function approve(kind: "match" | "result", id: string): Promise<void> {
  const session = await requireUser("approvals");
  if (kind === "match") {
    const doc = (await loadItems<MatchDoc>("matches")).find((m) => m.id === id);
    if (doc) await publishMatch(session, doc);
  } else {
    const doc = (await loadItems<EventResultDoc>("results")).find((r) => r.id === id);
    if (doc) await publishResult(session, doc);
  }
}

/** "Approve now" on the score desk: publishes the pending final and hands back the new revision. */
export async function approveMatchNow(id: string): Promise<{ ok: true; rev: number } | { ok: false; error: string }> {
  const session = await requireUser("approvals");
  const t = await getT();
  try {
    const doc = (await loadItems<MatchDoc>("matches")).find((m) => m.id === id);
    if (!doc) return { ok: false, error: t("Match not found. It may have been deleted.") };
    if (doc.approval !== "pending") return { ok: false, error: t("Nothing is waiting for approval on this match.") };
    return { ok: true, rev: await publishMatch(session, doc) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : t("Could not approve.") };
  }
}

/** Publishes everything waiting. Returns how many items were approved. */
export async function approveAll(): Promise<{ count: number }> {
  const session = await requireUser("approvals");
  const [matches, results] = await Promise.all([loadItems<MatchDoc>("matches"), loadItems<EventResultDoc>("results")]);
  let count = 0;
  for (const doc of matches.filter((m) => m.approval === "pending")) {
    await publishMatch(session, doc);
    count++;
  }
  for (const doc of results.filter((r) => r.approval === "pending")) {
    await publishResult(session, doc);
    count++;
  }
  return { count };
}

export async function reject(kind: "match" | "result", id: string, form: FormData): Promise<void> {
  const session = await requireUser("approvals");
  const note = String(form.get("note") ?? "").trim().slice(0, 300) || "Please check and resubmit.";
  if (kind === "match") {
    const doc = (await loadItems<MatchDoc>("matches")).find((m) => m.id === id);
    if (doc) await saveDoc("matches", { ...doc, approval: "rejected", note, rev: (doc.rev ?? 0) + 1 }, session, "rejected", `${scoreline(doc.draft)}: ${note}`);
  } else {
    const doc = (await loadItems<EventResultDoc>("results")).find((r) => r.id === id);
    if (doc) await saveDoc("results", { ...doc, approval: "rejected", note }, session, "rejected", `${doc.event.en}: ${note}`);
  }
}

export async function addAdjustment(_prev: FormState, form: FormData): Promise<FormState> {
  const session = await requireUser("medals");
  const t = await getT();
  const { values, errors } = parseFields(adjustmentFields(await getCountryOptions()), form);
  const g = Math.round(Number(values.gold ?? 0));
  const s = Math.round(Number(values.silver ?? 0));
  const b = Math.round(Number(values.bronze ?? 0));
  if (!g && !s && !b) errors.gold = t("Enter at least one non-zero medal count (use negative numbers to remove).");
  if (Object.keys(errors).length) return { errors, message: t("Please fix the highlighted fields.") };
  const doc: MedalAdjustmentDoc = {
    id: newId("adj"),
    countryCode: String(values.countryCode),
    gold: g,
    silver: s,
    bronze: b,
    reason: String(values.reason),
  };
  try {
    await saveDoc("medalAdjustments", doc, session, "adjusted medals", `${doc.countryCode} ${g}/${s}/${b}: ${doc.reason}`);
  } catch (error) {
    return { message: error instanceof Error ? error.message : t("Could not save.") };
  }
  redirect("/admin/medals?saved=1");
}

export async function removeAdjustment(id: string): Promise<void> {
  const session = await requireUser("medals");
  await deleteDoc("medalAdjustments", id, session, id);
}
