"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useT } from "./i18n";
import { Button } from "./ui/button";

function Submit({ label, destructive }: { label: string; destructive?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="animate-spin" />}
      {label}
    </Button>
  );
}

/** A server action behind an "are you sure?" dialog (replaces window.confirm). */
export function ConfirmAction({
  action,
  title,
  description,
  confirmLabel,
  destructive,
  trigger,
}: {
  action: (form: FormData) => Promise<void> | void;
  title: string;
  description?: string;
  confirmLabel: string;
  destructive?: boolean;
  trigger: ReactNode;
}) {
  const t = useT();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <form action={action}>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">{t("Cancel")}</AlertDialogCancel>
            <Submit label={confirmLabel} destructive={destructive} />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
