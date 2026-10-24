"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, CheckCheck, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useT } from "./i18n";
import { Button } from "./ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

/** Publishes everything waiting, after one confirmation. */
export function ApproveAll({ count, action }: { count: number; action: () => Promise<{ count: number }> }) {
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const run = () =>
    start(async () => {
      try {
        const result = await action();
        toast.success(
          result.count === 1
            ? t("Approved 1 item. It is official on the site.")
            : t("Approved {n} items. They are official on the site.", { n: result.count }),
        );
        setOpen(false);
        router.refresh();
      } catch {
        toast.error(t("That did not save. Check your connection and try again."));
      }
    });
  return (
    <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CheckCheck /> {t("Approve all ({n})", { n: count })}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Approve all {n} items?", { n: count })}</DialogTitle>
          <DialogDescription>{t("Every waiting score and result is published and becomes official on the site straight away.")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={pending}>
              {t("Cancel")}
            </Button>
          </DialogClose>
          <Button type="button" onClick={run} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <CheckCheck />}
            {t("Approve all")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Approve publishes straight away; Return asks for a reason the scorer will see. */
export function ApprovalDecision({
  label,
  approveAction,
  rejectAction,
}: {
  label: string;
  approveAction: () => Promise<void>;
  rejectAction: (form: FormData) => Promise<void>;
}) {
  const t = useT();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [which, setWhich] = useState<"approve" | "reject" | null>(null);
  const [open, setOpen] = useState(false);

  const run = (kind: "approve" | "reject", fn: () => Promise<void>, message: string) => {
    setWhich(kind);
    start(async () => {
      try {
        await fn();
        toast.success(message);
        setOpen(false);
        router.refresh();
      } catch {
        toast.error(t("That did not save. Check your connection and try again."));
      }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2 md:flex md:justify-end">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={pending}>
            <Undo2 /> {t("Return")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              run("reject", () => rejectAction(form), t("Returned to the scorer: {label}", { label }));
            }}
          >
            <DialogHeader>
              <DialogTitle>{t("Return to the scorer")}</DialogTitle>
              <DialogDescription>{t("{label}. The site keeps showing the last published version.", { label })}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="return-note" className="font-semibold">
                {t("Reason (shown to the scorer)")}
              </Label>
              <Textarea id="return-note" name="note" rows={3} maxLength={300} placeholder={t("e.g. Home score should be 2, please check the sheet.")} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("Cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={pending}>
                {pending && which === "reject" && <Loader2 className="animate-spin" />}
                {t("Return")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Button onClick={() => run("approve", approveAction, t("Published: {label}", { label }))} disabled={pending}>
        {pending && which === "approve" ? <Loader2 className="animate-spin" /> : <Check />}
        {t("Approve")}
      </Button>
    </div>
  );
}
