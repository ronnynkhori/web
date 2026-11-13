"use client";

import { useActionState } from "react";
import { saveDelegationProfile, type FormState } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import type { DelegationDoc } from "@/lib/registration/model";
import type { Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";

const field = "min-h-touch w-full rounded-sm border border-line bg-surface px-3 type-body text-fg";

export function ProfileForm({
  locale,
  delegation,
  sports,
}: {
  locale: Locale;
  delegation: DelegationDoc | null;
  sports: { id: string; name: string }[];
}) {
  const copy = regCopy(locale);
  const [state, action, pending] = useActionState(saveDelegationProfile, { errors: [], message: "" } satisfies FormState);
  const selected = new Set(delegation?.sports ?? []);
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <label className="flex flex-col gap-1 type-label">
        {copy.institution}
        <input name="institution" required defaultValue={delegation?.institution ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1 type-label">
        {copy.headName}
        <input name="headName" required defaultValue={delegation?.headName ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1 type-label">
        {copy.headPosition}
        <input name="headPosition" defaultValue={delegation?.headPosition ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1 type-label">
        {copy.email}
        <input name="email" type="email" required defaultValue={delegation?.email ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1 type-label">
        {copy.telephone}
        <input name="telephone" required defaultValue={delegation?.telephone ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1 type-label">
        {copy.officerName}
        <input name="officerName" required defaultValue={delegation?.officerName ?? ""} className={field} />
      </label>
      <label className="flex flex-col gap-1 type-label">
        {copy.officerContact}
        <input name="officerContact" defaultValue={delegation?.officerContact ?? ""} className={field} />
      </label>
      <fieldset className="flex flex-col gap-2">
        <legend className="type-label">{copy.sports}</legend>
        {sports.map((sport) => (
          <label key={sport.id} className="flex items-center gap-2 type-body">
            <input type="checkbox" name="sports" value={sport.id} defaultChecked={selected.has(sport.id)} />
            {sport.name}
          </label>
        ))}
      </fieldset>
      <label className="flex flex-col gap-1 type-label">
        {copy.estimatedAthletes}
        <input name="estimatedAthletes" type="number" min={0} defaultValue={delegation?.estimatedAthletes ?? 0} className={field} />
      </label>
      <label className="flex flex-col gap-1 type-label">
        {copy.estimatedOfficials}
        <input name="estimatedOfficials" type="number" min={0} defaultValue={delegation?.estimatedOfficials ?? 0} className={field} />
      </label>
      {state.message && <p className="m-0 type-body-s text-accent">{state.message}</p>}
      {state.errors.map((error) => (
        <p key={error} className="m-0 type-body-s text-accent">
          {error}
        </p>
      ))}
      <Button type="submit" variant="secondary" disabled={pending}>
        {copy.save}
      </Button>
    </form>
  );
}
