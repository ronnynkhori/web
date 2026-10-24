"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Clock, CloudOff, Loader2, Minus, Plus, ShieldCheck, TriangleAlert, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { approveMatchNow, saveMatchScore } from "@/app/admin/actions/results";
import type { Approval } from "@/lib/cms/types";
import { pick } from "@/lib/i18n/config";
import { addSetPoint, endSet, scoringFor } from "@/lib/live/scoring";
import type { EventStatus, Match, TimelineEvent } from "@/lib/live/types";
import { cn } from "@/lib/utils";
import { FlagChip } from "./flag-chip";
import { useAdminLocale, useT } from "./i18n";
import { StatusBadge } from "./status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

type Side = "home" | "away";
type Sync = "saved" | "saving" | "offline" | "error";

const statusLabels: Record<EventStatus, string> = {
  upcoming: "Not started",
  live: "Live",
  finished: "Final",
  postponed: "Postponed",
  cancelled: "Cancelled",
};

const kindLabel: Record<TimelineEvent["kind"], string> = {
  goal: "Goal",
  yellow: "Yellow card",
  red: "Red card",
  point: "Point",
  period: "Period",
};

const kindMark: Record<TimelineEvent["kind"], string> = {
  goal: "bg-foreground",
  yellow: "bg-highlight",
  red: "bg-live",
  point: "bg-foreground",
  period: "bg-muted-foreground",
};

const pendingKey = (id: string) => `gcr-pending-match-${id}`;
const revKey = (id: string) => `gcr-pending-match-${id}-rev`;

function SyncBadge({ sync }: { sync: Sync }) {
  const t = useT();
  if (sync === "saving")
    return (
      <StatusBadge tone="info">
        <Loader2 className="size-3 animate-spin" /> {t("Saving…")}
      </StatusBadge>
    );
  if (sync === "offline")
    return (
      <StatusBadge tone="warning">
        <CloudOff className="size-3" /> {t("Offline: kept on this phone, retrying")}
      </StatusBadge>
    );
  if (sync === "error")
    return (
      <StatusBadge tone="error">
        <TriangleAlert className="size-3" /> {t("Not saved")}
      </StatusBadge>
    );
  return (
    <StatusBadge tone="success">
      <Check className="size-3" /> {t("Saved")}
    </StatusBadge>
  );
}

/**
 * Phone-first score entry. Every tap saves; if the venue loses signal the latest
 * score is kept on the device and retried until it gets through. Undo steps back
 * through this session's changes.
 */
export function ScoreDesk({
  initial,
  rev: initialRev,
  approval: initialApproval,
  note,
  canApprove,
}: {
  initial: Match;
  rev: number;
  approval: Approval;
  note?: string;
  canApprove: boolean;
}) {
  const t = useT();
  const locale = useAdminLocale();
  const [match, setMatch] = useState<Match>(initial);
  const nameOf = (side: Side, m: Match = match) => pick(m[side].name, locale);
  const statusLabel = (status: EventStatus) => t(statusLabels[status]);
  const [history, setHistory] = useState<Match[]>([]);
  const [sync, setSync] = useState<Sync>("saved");
  const [approval, setApproval] = useState<Approval>(initialApproval);
  const [error, setError] = useState<string | null>(null);
  const [confirmFinal, setConfirmFinal] = useState(false);
  const [approving, setApproving] = useState(false);
  const [conflict, setConflict] = useState<{ match: Match; rev: number; by?: string } | null>(null);
  const latest = useRef(match);
  const rev = useRef(initialRev);
  const inFlight = useRef(false);
  const again = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retry = useRef<() => void>(() => undefined);
  const rules = scoringFor(match.sportId);
  const locked = match.status === "finished" && !canApprove;
  const setSport = rules.template === "sets";
  // Points go to the set in play until the match is final; after that the buttons correct sets won.
  const sets = setSport && (match.status === "live" || match.status === "upcoming");
  const setPoints = match.setPoints ?? { home: 0, away: 0 };
  const setNumber = (match.sets?.length ?? 0) + 1;

  const push = useCallback(async (force = false) => {
    clearTimeout(timer.current);
    // One save at a time, so each carries the revision the previous one returned.
    if (inFlight.current) {
      again.current = true;
      return;
    }
    inFlight.current = true;
    const draft = latest.current;
    setSync("saving");
    try {
      const result = await saveMatchScore(draft.id, draft, rev.current, force);
      if (!result.ok) {
        setSync("error");
        setError(result.error);
        if (result.conflict) setConflict(result.conflict);
        return;
      }
      rev.current = result.rev;
      localStorage.setItem(revKey(draft.id), String(result.rev));
      if (latest.current === draft) localStorage.removeItem(pendingKey(draft.id));
      setApproval(result.approval);
      setError(null);
      setSync("saved");
    } catch {
      setSync("offline");
      timer.current = setTimeout(() => retry.current(), 5000);
    } finally {
      inFlight.current = false;
      if (again.current) {
        again.current = false;
        timer.current = setTimeout(() => retry.current(), 0);
      }
    }
  }, []);

  function keepMine() {
    if (!conflict) return;
    rev.current = conflict.rev;
    setConflict(null);
    void push(true);
  }

  function takeSaved() {
    if (!conflict) return;
    rev.current = conflict.rev;
    latest.current = conflict.match;
    setMatch(conflict.match);
    setHistory([]);
    localStorage.removeItem(pendingKey(conflict.match.id));
    setConflict(null);
    setError(null);
    setSync("saved");
  }

  useEffect(() => {
    retry.current = () => void push();
  }, [push]);

  useEffect(() => {
    const saved = localStorage.getItem(pendingKey(initial.id));
    if (saved) {
      try {
        const pending = JSON.parse(saved) as Match;
        latest.current = pending;
        // The unsent score was based on the revision this phone last saved, not today's page load.
        const savedRev = Number(localStorage.getItem(revKey(initial.id)));
        if (Number.isFinite(savedRev) && localStorage.getItem(revKey(initial.id)) !== null) rev.current = savedRev;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring an unsent score from this device
        setMatch(pending);
        void push();
      } catch {
        localStorage.removeItem(pendingKey(initial.id));
      }
    }
    const online = () => void push();
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("online", online);
      clearTimeout(timer.current);
    };
  }, [initial.id, push]);

  function commit(next: Match) {
    setHistory((h) => [...h.slice(-29), latest.current]);
    latest.current = next;
    setMatch(next);
    localStorage.setItem(pendingKey(next.id), JSON.stringify(next));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void push(), 350);
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory((h) => h.slice(0, -1));
    latest.current = previous;
    setMatch(previous);
    localStorage.setItem(pendingKey(previous.id), JSON.stringify(previous));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void push(), 350);
  }

  const event = (kind: TimelineEvent["kind"], side: Side): TimelineEvent => ({
    id: `${kind}-${crypto.randomUUID().slice(0, 8)}`,
    minute: match.minute ?? 0,
    kind,
    side,
  });

  function add(side: Side, points: number) {
    if (sets) return commit(addSetPoint(match, side, points));
    const next = structuredClone(match);
    next[side].score += points;
    if (rules.template === "goals") next.timeline = [event("goal", side), ...next.timeline];
    if (next.status === "upcoming") next.status = "live";
    commit(next);
  }

  function subtract(side: Side) {
    if (sets) {
      if (setPoints[side] > 0) commit(addSetPoint(match, side, -1));
      return;
    }
    if (match[side].score === 0) return;
    const next = structuredClone(match);
    next[side].score -= 1;
    if (rules.template === "goals") {
      const index = next.timeline.findIndex((e) => e.kind === "goal" && e.side === side);
      if (index >= 0) next.timeline.splice(index, 1);
    }
    commit(next);
  }

  function card(side: Side, kind: "yellow" | "red") {
    commit({ ...match, timeline: [event(kind, side), ...match.timeline] });
  }

  function removeEvent(id: string) {
    const removed = match.timeline.find((e) => e.id === id);
    if (!removed) return;
    const next = structuredClone(match);
    next.timeline = next.timeline.filter((e) => e.id !== id);
    if (removed.kind === "goal") next[removed.side].score = Math.max(0, next[removed.side].score - 1);
    commit(next);
  }

  function applyStatus(status: EventStatus) {
    commit({ ...match, status, minute: status === "upcoming" ? null : rules.timed ? (match.minute ?? 0) : null });
  }

  function setStatus(status: EventStatus) {
    if (!status || status === match.status) return;
    if (status === "finished") return setConfirmFinal(true);
    applyStatus(status);
  }

  async function approveNow() {
    if (sync !== "saved") return;
    setApproving(true);
    try {
      const result = await approveMatchNow(match.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      rev.current = result.rev;
      localStorage.setItem(revKey(match.id), String(result.rev));
      setApproval("approved");
      toast.success(t("Approved. The final score is official on the site."));
    } catch {
      toast.error(t("That did not save. Check your connection and try again."));
    } finally {
      setApproving(false);
    }
  }

  function setMinute(minute: number) {
    commit({ ...match, minute: Math.max(0, Math.min(130, Number.isFinite(minute) ? minute : 0)) });
  }

  function closeSet() {
    const next = endSet(match);
    if (next) commit(next);
  }

  const stepLabel = (n: number) => (rules.template === "goals" ? t("Goal") : sets ? t("Point") : `${n}`);

  const team = (side: Side) => {
    const s = match[side];
    const name = nameOf(side);
    return (
      <Card className="gap-0 py-0">
        <CardContent className="flex flex-col gap-3 p-3 md:p-4">
          <div className="flex items-center gap-2">
            <FlagChip code={s.countryCode} size="md" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold md:text-base">{name}</span>
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(rules.steps.length, 3)}, minmax(0, 1fr))` }}>
            {rules.steps.map((n) => (
              <Button
                key={n}
                type="button"
                size="xl"
                onClick={() => add(side, n)}
                disabled={locked}
                className="h-16 px-2 text-lg md:h-14"
                aria-label={
                  rules.template === "goals"
                    ? t("Add a goal for {team}", { team: name })
                    : sets
                      ? t("Add a point in this set for {team}", { team: name })
                      : t("Add {n} for {team}", { n, team: name })
                }
              >
                <Plus className="size-5" /> {stepLabel(n)}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => subtract(side)}
              disabled={(sets ? setPoints[side] : s.score) === 0 || locked}
              className="flex-1"
              aria-label={sets ? t("Take a point off {team} in this set", { team: name }) : t("Take one off {team}", { team: name })}
            >
              <Minus /> 1
            </Button>
            {rules.template === "goals" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => card(side, "yellow")}
                  disabled={locked}
                  className="flex-1 px-0"
                  aria-label={t("Yellow card for {team}", { team: name })}
                >
                  <span aria-hidden="true" className="h-4 w-3 rounded-[2px] bg-highlight" />
                  <span className="sr-only md:not-sr-only">{t("Yellow")}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => card(side, "red")}
                  disabled={locked}
                  className="flex-1 px-0"
                  aria-label={t("Red card for {team}", { team: name })}
                >
                  <span aria-hidden="true" className="h-4 w-3 rounded-[2px] bg-live" />
                  <span className="sr-only md:not-sr-only">{t("Red")}</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div className="sticky top-14 z-20 -mx-4 flex flex-wrap items-center gap-2 border-b bg-background/95 px-4 py-2 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0" aria-live="polite">
        <SyncBadge sync={sync} />
        {approval === "pending" && <StatusBadge tone="warning">{t("Waiting for approval")}</StatusBadge>}
        {approval === "approved" && match.status === "finished" && <StatusBadge tone="success">{t("Official")}</StatusBadge>}
        <Button type="button" variant="outline" onClick={undo} disabled={!history.length || locked} className="ml-auto">
          <Undo2 /> {t("Undo")}
        </Button>
      </div>

      {sync === "error" && !conflict && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm md:flex-row md:items-center">
          <TriangleAlert className="hidden size-5 shrink-0 text-destructive md:block" aria-hidden="true" />
          <span className="flex flex-1 flex-col gap-0.5">
            <strong className="text-destructive">{t("This score is not saved yet")}</strong>
            <span>{error ?? t("That did not save. Check your connection and try again.")}</span>
            <span className="text-xs text-muted-foreground">{t("It is kept on this phone until it saves.")}</span>
          </span>
          <Button type="button" variant="outline" onClick={() => void push()} className="bg-card">
            {t("Try again")}
          </Button>
        </div>
      )}

      {approval === "rejected" && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <span className="flex flex-col gap-1">
            <strong>{t("Returned by a results manager")}</strong>
            <span>{note ? t(note) : t("Please check the score and submit the final again.")}</span>
            <span className="text-xs text-destructive/80">{t("Fix the score, then mark it Final again to resend it.")}</span>
          </span>
        </div>
      )}

      {approval === "pending" && match.status === "finished" && sync === "saved" && (
        <div role="status" className="flex flex-col gap-3 rounded-xl border border-highlight bg-warning px-4 py-3 text-sm text-warning-foreground md:flex-row md:items-center">
          <Clock className="hidden size-5 shrink-0 md:block" aria-hidden="true" />
          <span className="flex flex-1 flex-col gap-0.5">
            <strong>{t("Final score sent to Approvals")}</strong>
            <span>{t("The public site keeps showing the last live score until it is approved.")}</span>
          </span>
          {canApprove && (
            <span className="flex gap-2 *:max-md:flex-1">
              <Button asChild variant="outline" size="sm" className="bg-card">
                <Link href="/admin/approvals">{t("Open Approvals")}</Link>
              </Button>
              <Button type="button" size="sm" onClick={approveNow} disabled={approving}>
                {approving ? <Loader2 className="animate-spin" /> : <ShieldCheck />} {t("Approve now")}
              </Button>
            </span>
          )}
        </div>
      )}

      <section aria-label={t("Scoreboard")} className="overflow-hidden rounded-xl bg-sidebar text-sidebar-foreground shadow-sm">
        <div className="flex items-center justify-center gap-2 border-b border-sidebar-border px-4 py-2 text-xs font-semibold tracking-wide uppercase">
          {match.status === "live" ? (
            <StatusBadge tone="live">
              {t("Live")}
              {rules.timed && match.minute != null ? ` ${match.minute}′` : ""}
            </StatusBadge>
          ) : (
            <span className="text-sidebar-foreground/70">{statusLabel(match.status)}</span>
          )}
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-4 md:px-6 md:py-5">
          {(["home", "away"] as const).map((side, i) => (
            <div key={side} className={cn("flex min-w-0 flex-col items-center gap-2 text-center", i === 1 && "order-3")}>
              <FlagChip code={match[side].countryCode} size="lg" className="ring-white/20" />
              <span className="w-full truncate text-xs font-semibold text-sidebar-foreground/85 md:text-sm">{nameOf(side)}</span>
            </div>
          ))}
          <output
            aria-live="polite"
            aria-label={t("Score {home} to {away}", { home: match.home.score, away: match.away.score })}
            className="order-2 flex items-center gap-3 font-display text-6xl leading-none tabular-nums md:text-7xl">
            <span>{match.home.score}</span>
            <span className="text-3xl text-sidebar-foreground/40">–</span>
            <span>{match.away.score}</span>
          </output>
        </div>
        {setSport && (
          <p className="m-0 border-t border-sidebar-border px-4 py-2 text-center text-xs text-sidebar-foreground/70">
            {t("Sets won")}
            {match.sets?.length ? ` · ${match.sets.map((s) => `${s.home}–${s.away}`).join(", ")}` : ""}
          </p>
        )}
      </section>

      {sets && (
        <Card className="gap-0 py-0">
          <CardContent className="flex items-center gap-3 p-3 md:p-4">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("Set {n} in play", { n: setNumber })}</span>
              <output
                aria-live="polite"
                aria-label={t("Set {n}: {home} {homePoints}, {away} {awayPoints}", {
                  n: setNumber,
                  home: nameOf("home"),
                  homePoints: setPoints.home,
                  away: nameOf("away"),
                  awayPoints: setPoints.away,
                })}
                className="font-display text-4xl leading-tight tabular-nums"
              >
                {setPoints.home} – {setPoints.away}
              </output>
            </div>
            <Button type="button" size="lg" onClick={closeSet} disabled={setPoints.home === setPoints.away || locked}>
              <Check /> {t("End set {n}", { n: setNumber })}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        {team("home")}
        {team("away")}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("Match status")}</span>
        <ToggleGroup
          type="single"
          variant="outline"
          value={match.status}
          onValueChange={(v) => setStatus(v as EventStatus)}
          disabled={locked}
          className="grid w-full grid-cols-2 bg-card md:grid-cols-4"
          aria-label={t("Match status")}
        >
          {(["upcoming", "live", "finished", "postponed"] as const).map((s) => (
            <ToggleGroupItem
              key={s}
              value={s}
              className={cn("h-12 px-1 text-xs font-semibold md:h-10 md:text-sm", s === "live" && "data-[state=on]:bg-live data-[state=on]:text-live-foreground")}
            >
              {statusLabel(s)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {rules.timed && match.status === "live" && (
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-3 py-2.5 md:px-4">
          <span className="text-sm font-semibold">{t("Minute")}</span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" onClick={() => setMinute((match.minute ?? 0) - 1)} aria-label={t("Minute down")}>
              <Minus />
            </Button>
            <input
              type="number"
              inputMode="numeric"
              value={match.minute ?? 0}
              onChange={(e) => setMinute(Number(e.target.value))}
              className="h-11 w-16 rounded-md border border-input bg-card text-center font-display text-2xl tabular-nums outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring md:h-9"
              aria-label={t("Match minute")}
            />
            <Button type="button" variant="outline" size="icon" onClick={() => setMinute((match.minute ?? 0) + 1)} aria-label={t("Minute up")}>
              <Plus />
            </Button>
          </div>
        </div>
      )}

      {rules.template === "goals" && match.timeline.length > 0 && (
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-3 [.border-b]:pb-3">
            <CardTitle className="text-sm">{t("Timeline")}</CardTitle>
          </CardHeader>
          <ul className="divide-y">
            {match.timeline.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-1 pr-1 pl-4 md:pl-6">
                <span className="w-9 font-display text-xl tabular-nums">{e.minute}′</span>
                <span aria-hidden="true" className={cn("h-3.5 w-2.5 rounded-[2px]", kindMark[e.kind])} />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {t(kindLabel[e.kind])} · <span className="text-muted-foreground">{nameOf(e.side)}</span>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEvent(e.id)}
                  disabled={locked}
                  aria-label={t("Remove {event} at {minute}′", { event: t(kindLabel[e.kind]), minute: e.minute })}
                >
                  <X />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <AlertDialog open={conflict !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Someone else updated this match")}</AlertDialogTitle>
            <AlertDialogDescription>
              {conflict &&
                `${t(conflict.by ? "{name} saved {home} {homeScore} – {awayScore} {away} ({status})." : "The saved score is {home} {homeScore} – {awayScore} {away} ({status}).", {
                  name: conflict.by ?? "",
                  home: nameOf("home", conflict.match),
                  homeScore: conflict.match.home.score,
                  awayScore: conflict.match.away.score,
                  away: nameOf("away", conflict.match),
                  status: statusLabel(conflict.match.status),
                })} ${t("Yours is {homeScore} – {awayScore} ({status}). Which one is right?", {
                  homeScore: match.home.score,
                  awayScore: match.away.score,
                  status: statusLabel(match.status),
                })}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <p className="m-0 text-sm text-muted-foreground">{t("Keeping yours replaces theirs on the site. If unsure, check with the other scorer first.")}</p>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={keepMine}>{t("Keep mine")}</AlertDialogCancel>
            <AlertDialogAction onClick={takeSaved}>{t("Use the saved score")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmFinal} onOpenChange={setConfirmFinal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Submit the final score?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("{home} {homeScore} – {awayScore} {away}. It goes to Approvals; the site keeps showing the live score until a results manager approves it.", {
                home: nameOf("home"),
                homeScore: match.home.score,
                awayScore: match.away.score,
                away: nameOf("away"),
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Keep editing")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => applyStatus("finished")}>{t("Send to Approvals")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
