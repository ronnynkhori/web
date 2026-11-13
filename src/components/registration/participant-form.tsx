"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/config";
import { saveParticipantForm, type FormState } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { fileKinds, officialFunctions, type FileKind, type ParticipantDoc, type ParticipantFileDoc, type ParticipantKind } from "@/lib/registration/model";

const field = "min-h-touch w-full rounded-sm border border-line bg-surface px-3 type-body text-fg";

function Text({ label, name, value, type = "text", required = false }: { label: string; name: string; value: string; type?: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1 type-label">
      {label}
      <input name={name} type={type} required={required} defaultValue={value} className={field} />
    </label>
  );
}

export function ParticipantForm({
  locale,
  person,
  kind,
  sports,
  files,
}: {
  locale: Locale;
  person: ParticipantDoc;
  kind: ParticipantKind;
  sports: { id: string; name: string }[];
  files: ParticipantFileDoc[];
}) {
  const copy = regCopy(locale);
  const [state, action, pending] = useActionState(saveParticipantForm, { errors: [], message: "" } satisfies FormState);
  const onFile = (kind: FileKind) => files.find((file) => file.kind === kind);
  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={state.id || person.id} />
      <input type="hidden" name="kind" value={kind} />
      <Text label={copy.fullName} name="fullName" value={person.fullName} required />
      <Text label={copy.dateOfBirth} name="dateOfBirth" value={person.dateOfBirth} type="date" required />
      {kind === "athlete" && (
        <label className="flex flex-col gap-1 type-label">
          {copy.sex}
          <select name="sex" defaultValue={person.sex} required className={field}>
            <option value="" />
            <option value="female">{copy.female}</option>
            <option value="male">{copy.male}</option>
          </select>
        </label>
      )}
      <Text label={copy.nationality} name="nationality" value={person.nationality} required />
      <Text label={copy.documentNumber} name="documentNumber" value={person.documentNumber} required />
      <Text label={copy.documentExpiry} name="documentExpiry" value={person.documentExpiry} type="date" required />
      <label className="flex flex-col gap-1 type-label">
        {copy.sport}
        <select name="sportId" defaultValue={person.sportId} required={kind === "athlete"} className={field}>
          <option value="" />
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </select>
      </label>
      {kind === "athlete" ? (
        <>
          <Text label={copy.discipline} name="discipline" value={person.discipline} required />
          <Text label={copy.ageCategory} name="ageCategory" value={person.ageCategory} required />
          <Text label={copy.competitionCategory} name="competitionCategory" value={person.competitionCategory} required />
          <Text label={copy.federation} name="federation" value={person.federation} required />
          <Text label={copy.club} name="club" value={person.club} />
          <Text label={copy.jersey} name="jerseyNumber" value={person.jerseyNumber} />
          <Text label={copy.emergencyName} name="emergencyName" value={person.emergencyName} required />
          <Text label={copy.emergencyPhone} name="emergencyPhone" value={person.emergencyPhone} required />
          <Text label={copy.accessibility} name="accessibility" value={person.accessibility} />
        </>
      ) : (
        <>
          <label className="flex flex-col gap-1 type-label">
            {copy.function}
            <select name="function" defaultValue={person.function} required className={field}>
              <option value="" />
              {officialFunctions.map((fn) => (
                <option key={fn} value={fn}>
                  {copy.functions[fn]}
                </option>
              ))}
            </select>
          </label>
          <Text label={copy.functionOther} name="functionOther" value={person.functionOther} />
          <Text label={copy.contactEmail} name="contactEmail" value={person.contactEmail} type="email" />
          <Text label={copy.contactPhone} name="contactPhone" value={person.contactPhone} required />
        </>
      )}
      <p className="m-0 type-body-s text-fg-muted">{copy.minorNote}</p>
      <Text label={copy.guardianName} name="guardianName" value={person.guardianName} />
      <Text label={copy.guardianContact} name="guardianContact" value={person.guardianContact} />
      <fieldset className="flex flex-col gap-3">
        <legend className="type-label">{copy.documents}</legend>
        {fileKinds.map((fileKind) => {
          const current = onFile(fileKind);
          return (
            <label key={fileKind} className="flex flex-col gap-1 type-body-s">
              {copy.files[fileKind]}
              {current && (
                <a href={`/api/registration/file/${current.id}`} className="text-link">
                  {copy.currentFile}: {current.filename}
                </a>
              )}
              <input name={fileKind} type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" />
            </label>
          );
        })}
      </fieldset>
      {state.message && <p className="m-0 type-body-s text-accent">{state.message}</p>}
      {state.errors.map((error) => (
        <p key={error} className="m-0 type-body-s text-accent">
          {error}
        </p>
      ))}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="intent" value="save" variant="ghost" disabled={pending}>
          {copy.save}
        </Button>
        <Button type="submit" name="intent" value="submit" variant="secondary" disabled={pending}>
          {copy.submit}
        </Button>
      </div>
    </form>
  );
}
