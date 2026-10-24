"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Check, Loader2, Plus, Save, Send, X } from "lucide-react";
import { saveEventResult, type EventResultInput } from "@/app/admin/actions/results";
import type { EventResultRow } from "@/lib/cms/types";
import { locales, type Localized } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { ActionBar } from "./action-bar";
import { useT } from "./i18n";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { NativeSelect } from "./ui/native-select";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface Props {
  id: string | null;
  sports: Array<{ id: string; name: string }>;
  countries: Array<{ code: string; name: string }>;
  initial: { sportId: string; event: Localized; medalEvent: boolean; rows: EventResultRow[] };
  canPublish: boolean;
}

const emptyRow = (rank: number): EventResultRow => ({ rank, athlete: "", countryCode: "", result: "" });

const placeTone = (rank: number, medal: boolean) =>
  !medal
    ? "bg-muted text-foreground"
    : rank === 1
      ? "bg-medal-gold text-foreground"
      : rank === 2
        ? "bg-medal-silver text-foreground"
        : rank === 3
          ? "bg-medal-bronze text-foreground"
          : "bg-muted text-foreground";

/** Ranked results for one event (athletics, swimming, judo...). */
export function ResultEditor({ id, sports, countries, initial, canPublish }: Props) {
  const t = useT();
  const [sportId, setSportId] = useState(initial.sportId);
  const [event, setEvent] = useState<Localized>(initial.event);
  const [medalEvent, setMedalEvent] = useState(initial.medalEvent);
  const [rows, setRows] = useState<EventResultRow[]>(initial.rows.length ? initial.rows : [emptyRow(1), emptyRow(2), emptyRow(3)]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [intent, setIntent] = useState<EventResultInput["intent"] | null>(null);

  const update = (index: number, patch: Partial<EventResultRow>) => setRows((all) => all.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  function submit(next: EventResultInput["intent"]) {
    setIntent(next);
    setError(null);
    startTransition(async () => {
      const filled = rows.filter((r) => r.athlete.trim() || r.countryCode || r.result.trim());
      const result = await saveEventResult(id, { sportId, event, medalEvent, rows: filled, intent: next });
      if (result?.error) setError(result.error);
    });
  }

  const busy = (which: EventResultInput["intent"]) => pending && intent === which;

  return (
    <div className="flex flex-col gap-5">
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base">{t("Event")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <Field className="gap-2">
            <FieldLabel htmlFor="r-sport" className="font-semibold">
              {t("Sport")}
            </FieldLabel>
            <NativeSelect id="r-sport" value={sportId} onChange={(e) => setSportId(e.target.value)}>
              <option value="">{t("Choose…")}</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="r-event-en" className="font-semibold">
              {t("Event name")} <span className="text-destructive">*</span>
            </FieldLabel>
            <Tabs defaultValue="en" className="gap-2">
              <TabsList className="h-9 self-start">
                {locales.map((l) => (
                  <TabsTrigger key={l} value={l} className="relative min-w-12 px-3 text-xs font-bold uppercase">
                    {l}
                    {l !== "en" && !event[l]?.trim() && <span aria-label={t("missing")} className="absolute top-1 right-1 size-1.5 rounded-full bg-highlight" />}
                  </TabsTrigger>
                ))}
              </TabsList>
              {locales.map((l) => (
                <TabsContent key={l} value={l}>
                  <Input
                    id={`r-event-${l}`}
                    value={event[l] ?? ""}
                    onChange={(e) => setEvent({ ...event, [l]: e.target.value })}
                    placeholder={l === "en" ? "Athletics · 100 m boys final" : t("Optional: shows the English text when empty")}
                    aria-label={t("Event name ({language})", { language: l.toUpperCase() })}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </Field>
          <Field orientation="horizontal" className="items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="r-medal" className="font-semibold">
                {t("Medal event")}
              </FieldLabel>
              <span className="text-xs text-muted-foreground">{t("Places 1 to 3 count in the medal table.")}</span>
            </div>
            <Switch id="r-medal" checked={medalEvent} onCheckedChange={setMedalEvent} />
          </Field>
        </CardContent>
      </Card>

      <Card className="gap-0 pb-0">
        <CardHeader className="border-b [.border-b]:pb-4">
          <CardTitle className="text-base">{t("Placings")}</CardTitle>
          <CardDescription className="text-xs">{t("Empty rows are ignored when you save.")}</CardDescription>
        </CardHeader>
        <div className="hidden grid-cols-[3.5rem_minmax(0,1fr)_11rem_7rem_7rem_2.25rem] gap-2 border-b bg-muted/60 px-6 py-2 text-xs font-semibold text-muted-foreground md:grid">
          <span>{t("Place")}</span>
          <span>{t("Athlete or team")}</span>
          <span>{t("Country")}</span>
          <span>{t("Result")}</span>
          <span>{t("Notes")}</span>
          <span className="sr-only">{t("Remove")}</span>
        </div>
        <ol className="flex flex-col divide-y">
          {rows.map((r, i) => (
            <li
              key={i}
              className="grid grid-cols-[3rem_minmax(0,1fr)_2.75rem] gap-x-3 gap-y-2 px-4 py-4 md:grid-cols-[3.5rem_minmax(0,1fr)_11rem_7rem_7rem_2.25rem] md:items-center md:gap-2 md:px-6 md:py-2.5"
            >
              <div className="row-span-3 flex flex-col items-center gap-1 md:row-span-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={r.rank}
                  onChange={(e) => update(i, { rank: Number(e.target.value) })}
                  className={cn("h-12 w-12 rounded-full border-0 px-0 text-center font-display text-xl shadow-none md:h-9 md:w-12 md:rounded-md", placeTone(r.rank, medalEvent))}
                  aria-label={t("Row {n} place", { n: i + 1 })}
                />
              </div>
              <Input
                value={r.athlete}
                onChange={(e) => update(i, { athlete: e.target.value })}
                aria-label={t("Row {n} athlete", { n: i + 1 })}
                placeholder={t("Initial and surname")}
                className="col-start-2 md:col-start-auto"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setRows((all) => all.filter((_, j) => j !== i))}
                aria-label={t("Remove row {n}", { n: i + 1 })}
                className="col-start-3 row-start-1 text-muted-foreground hover:text-destructive md:col-start-6"
              >
                <X />
              </Button>
              <NativeSelect
                value={r.countryCode}
                onChange={(e) => update(i, { countryCode: e.target.value })}
                wrapperClassName="col-span-2 col-start-2 md:col-span-1 md:col-start-3 md:row-start-1"
                aria-label={t("Row {n} country", { n: i + 1 })}
              >
                <option value="">{t("Country…")}</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </NativeSelect>
              <div className="col-span-2 col-start-2 grid grid-cols-2 gap-2 md:contents">
                <Input
                  value={r.result}
                  onChange={(e) => update(i, { result: e.target.value })}
                  aria-label={t("Row {n} result", { n: i + 1 })}
                  placeholder={t("Result, e.g. 10.84")}
                  className="md:col-start-4 md:row-start-1"
                />
                <Input
                  value={r.notes ?? ""}
                  onChange={(e) => update(i, { notes: e.target.value })}
                  aria-label={t("Row {n} notes", { n: i + 1 })}
                  placeholder={t("Notes: PB, GR")}
                  className="md:col-start-5 md:row-start-1"
                />
              </div>
            </li>
          ))}
        </ol>
        <div className="border-t p-3 md:px-6">
          <Button type="button" variant="outline" onClick={() => setRows((all) => [...all, emptyRow(all.length + 1)])} className="w-full md:w-auto">
            <Plus /> {t("Add row")}
          </Button>
        </div>
      </Card>

      <ActionBar className="flex-wrap">
        <Button type="button" onClick={() => submit("submit")} disabled={pending}>
          {busy("submit") ? <Loader2 className="animate-spin" /> : <Send />}
          {busy("submit") ? t("Sending…") : t("Submit for approval")}
        </Button>
        {canPublish && (
          <Button type="button" variant="secondary" onClick={() => submit("publish")} disabled={pending} className="max-md:order-last max-md:basis-full">
            {busy("publish") ? <Loader2 className="animate-spin" /> : <Check />}
            {busy("publish") ? t("Publishing…") : t("Approve and publish now")}
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => submit("draft")} disabled={pending}>
          {busy("draft") ? <Loader2 className="animate-spin" /> : <Save />}
          {busy("draft") ? t("Saving…") : t("Save draft")}
        </Button>
      </ActionBar>
    </div>
  );
}
