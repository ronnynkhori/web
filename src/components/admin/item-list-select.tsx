"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { BulkResult } from "@/app/admin/actions/content";
import { cn } from "@/lib/utils";
import { useT } from "./i18n";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";

interface Selection {
  selected: Set<string>;
  toggle: (id: string, on: boolean) => void;
  all: string[];
  setAll: (on: boolean) => void;
}

const SelectionContext = createContext<Selection | null>(null);

/**
 * Tick boxes on any list plus a pinned "Delete selected (n)" bar. The list itself
 * stays server-rendered; only the boxes and the bar are client components.
 */
export function BulkSelect({
  ids,
  action,
  noun,
  description = "They disappear from the public site immediately. This cannot be undone.",
  children,
}: {
  ids: string[];
  action: (ids: string[]) => Promise<BulkResult>;
  /** Plural, e.g. "announcements". */
  noun: string;
  description?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const t = useT();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  // Rows deleted elsewhere drop out of the selection on the next render.
  const selected = useMemo(() => new Set([...picked].filter((id) => ids.includes(id))), [picked, ids]);

  const value = useMemo<Selection>(
    () => ({
      selected,
      all: ids,
      toggle: (id, on) =>
        setPicked((s) => {
          const next = new Set(s);
          if (on) next.add(id);
          else next.delete(id);
          return next;
        }),
      setAll: (on) => setPicked(on ? new Set(ids) : new Set()),
    }),
    [selected, ids],
  );

  const remove = () =>
    start(async () => {
      try {
        const result = await action([...selected]);
        if ("error" in result) {
          toast.error(t(result.error));
          return;
        }
        toast.success(result.count === 1 ? t("Deleted 1 item.") : t("Deleted {n} items.", { n: result.count }));
        setPicked(new Set());
        setConfirm(false);
        router.refresh();
      } catch {
        toast.error(t("That did not save. Check your connection and try again."));
      }
    });

  const count = selected.size;
  return (
    <SelectionContext.Provider value={value}>
      {children}
      {count > 0 && (
        <div
          role="region"
          aria-label={t("Selected items")}
          className="fixed inset-x-0 bottom-[var(--tabbar-h)] z-40 flex items-center gap-2 border-t bg-sidebar px-4 py-3 text-sidebar-foreground shadow-lg md:inset-x-auto md:right-8 md:bottom-6 md:left-auto md:rounded-xl md:border md:border-sidebar-border md:px-4"
        >
          <span className="text-sm font-semibold" aria-live="polite">
            {t("{n} selected", { n: count })}
          </span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setPicked(new Set())} className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground md:ml-2">
            <X /> {t("Clear")}
          </Button>
          <Button type="button" variant="outline-destructive" size="sm" onClick={() => setConfirm(true)}>
            <Trash2 /> {t("Delete selected ({n})", { n: count })}
          </Button>
        </div>
      )}
      <AlertDialog open={confirm} onOpenChange={(o) => !pending && setConfirm(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{count === 1 ? t("Delete 1 item?") : t("Delete {n} {noun}?", { n: count, noun: t(noun) })}</AlertDialogTitle>
            <AlertDialogDescription>{t(description)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={pending}>
              {t("Cancel")}
            </AlertDialogCancel>
            <Button type="button" variant="destructive" onClick={remove} disabled={pending} className="w-full sm:w-auto">
              {pending && <Loader2 className="animate-spin" />}
              {t("Delete {n}", { n: count })}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SelectionContext.Provider>
  );
}

/** One row's tick box. Renders nothing outside a BulkSelect. */
export function SelectBox({ id, label, className }: { id: string; label: string; className?: string }) {
  const ctx = useContext(SelectionContext);
  const t = useT();
  if (!ctx) return null;
  return (
    <Checkbox
      checked={ctx.selected.has(id)}
      onCheckedChange={(v) => ctx.toggle(id, v === true)}
      aria-label={t("Select {label}", { label })}
      className={cn("size-5 bg-card", className)}
    />
  );
}

export function SelectAllBox({ className }: { className?: string }) {
  const ctx = useContext(SelectionContext);
  const t = useT();
  if (!ctx || !ctx.all.length) return null;
  const n = ctx.selected.size;
  return (
    <Checkbox
      checked={n === 0 ? false : n === ctx.all.length ? true : "indeterminate"}
      onCheckedChange={(v) => ctx.setAll(v === true)}
      aria-label={t("Select all")}
      className={cn("size-5 bg-card", className)}
    />
  );
}
