"use client";

import { useActionState } from "react";
import { Button } from "@/components/admin/ui/button";
import { decideRegistration, type FormState } from "@/lib/registration/actions";

const field = "h-11 w-full rounded-md border bg-background px-3 text-sm";

export function DecisionForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(decideRegistration, { errors: [], message: "" } satisfies FormState);
  return (
    <form action={action} className="flex max-w-lg flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <label className="flex flex-col gap-1 text-sm font-medium">
        Decision
        <select name="status" required className={field} defaultValue="review">
          <option value="review">Under review</option>
          <option value="correction">Needs correction</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Note for the delegation
        <textarea name="reviewNote" rows={4} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
      </label>
      {state.message && <p className="text-sm text-destructive">{state.message}</p>}
      {state.errors.map((error) => (
        <p key={error} className="text-sm text-destructive">
          {error}
        </p>
      ))}
      <Button type="submit" disabled={pending} className="self-start">
        Save decision
      </Button>
    </form>
  );
}
