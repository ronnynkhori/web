"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, CircleSlash, Eye, RotateCcw, Undo2 } from "lucide-react";
import { decideRegistration, type FormState } from "@/lib/registration/actions";
import type { RegistrationStatus } from "@/lib/registration/model";
import { cn } from "@/lib/utils";
import { useT } from "../i18n";
import { Button } from "../ui/button";

const choice: Record<string, { icon: typeof CheckCircle2; title: string; help: string; tone: string; noteRequired: boolean }> = {
  approved: {
    icon: CheckCircle2,
    title: "Approve",
    help: "Issues the registration number. The officer is notified.",
    tone: "peer-checked:border-success-foreground peer-checked:bg-success [&_svg]:text-success-foreground",
    noteRequired: false,
  },
  correction: {
    icon: Undo2,
    title: "Request a correction",
    help: "Unlocks the record so the officer can fix it and submit again.",
    tone: "peer-checked:border-highlight peer-checked:bg-warning [&_svg]:text-warning-foreground",
    noteRequired: true,
  },
  rejected: {
    icon: CircleSlash,
    title: "Reject",
    help: "Final for this entry. The place returns to the country's quota.",
    tone: "peer-checked:border-primary peer-checked:bg-secondary [&_svg]:text-primary",
    noteRequired: true,
  },
  review: {
    icon: Eye,
    title: "Mark as under review",
    help: "Tells colleagues and the officer that someone is checking it.",
    tone: "peer-checked:border-foreground/40 peer-checked:bg-muted [&_svg]:text-muted-foreground",
    noteRequired: false,
  },
};

const reopen = {
  icon: RotateCcw,
  title: "Reopen for review",
  help: "Moves the record back to Under review. The registration number is kept.",
  tone: "peer-checked:border-foreground/40 peer-checked:bg-muted [&_svg]:text-muted-foreground",
  noteRequired: true,
};

/** The reviewer's decision: one choice, a note when the officer must act, then save (and go to the next record). */
export function DecisionPanel({
  id,
  status,
  options,
  nextId,
  readOnly,
  hasProblems,
}: {
  id: string;
  status: RegistrationStatus;
  options: RegistrationStatus[];
  nextId?: string;
  readOnly: boolean;
  hasProblems: boolean;
}) {
  const t = useT();
  const [state, action, pending] = useActionState(decideRegistration, { errors: [], message: "" } satisfies FormState);
  const reopening = status === "approved" || status === "rejected";
  const [picked, setPicked] = useState<string>(reopening ? "review" : "");
  const meta = (value: string) => (reopening ? reopen : choice[value]);
  const noteRequired = picked ? meta(picked).noteRequired : false;

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      {nextId && <input type="hidden" name="next" value={nextId} />}
      <fieldset className="flex flex-col gap-2" disabled={readOnly || pending}>
        <legend className="sr-only">{t("Decision")}</legend>
        {options.map((value) => {
          const item = meta(value);
          const Icon = item.icon;
          return (
            <label key={value} className="relative block">
              <input type="radio" name="status" value={value} checked={picked === value} onChange={() => setPicked(value)} className="peer sr-only" required />
              <span
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
                  item.tone,
                )}
              >
                <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{t(item.title)}</span>
                  <span className="text-xs text-muted-foreground">{t(item.help)}</span>
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
      {picked === "approved" && hasProblems && (
        <p className="rounded-md border border-highlight bg-warning px-3 py-2 text-xs font-medium text-warning-foreground">
          {t("Some automatic checks did not pass. Approve only if you have checked them yourself.")}
        </p>
      )}
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        <span>
          {reopening ? t("Reason for reopening") : t("Note for the delegation")}{" "}
          <span className="font-normal text-muted-foreground">{noteRequired ? t("(required)") : t("(optional)")}</span>
        </span>
        <textarea
          name="reviewNote"
          rows={4}
          required={noteRequired}
          disabled={readOnly || pending}
          placeholder={picked === "correction" ? t("e.g. The photograph is blurred. Upload a clear passport-style photo.") : undefined}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
        />
      </label>
      {(state.message || state.errors.length > 0) && (
        <div role="alert" className="flex flex-col gap-1 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.message && <p>{state.message}</p>}
          {state.errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}
      {readOnly ? (
        <p className="text-xs text-muted-foreground">{t("Decisions are saved once a database is connected. This demonstration is read-only.")}</p>
      ) : (
        <Button type="submit" disabled={pending || !picked} size="lg" className="w-full">
          {pending ? t("Saving…") : nextId && picked && picked !== "review" ? t("Save and open the next one") : t("Save decision")}
        </Button>
      )}
    </form>
  );
}
