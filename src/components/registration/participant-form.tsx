"use client";

import { useActionState, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";
import { saveParticipantForm, type FormState } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import { fileKinds, officialFunctions, type FileKind, type ParticipantDoc, type ParticipantFileDoc, type ParticipantKind } from "@/lib/registration/model";
import { portalCopy } from "@/lib/registration/portal-copy";
import { isMinor } from "@/lib/registration/rules";
import { ErrorList, Field, FormSection, inputClass } from "./portal/fields";

function Text({ label, name, value, type = "text", required = false, hint, wide, mark, placeholder, autoComplete }: { label: string; name: string; value: string; type?: string; required?: boolean; hint?: string; wide?: boolean; mark: { required: string; optional: string }; placeholder?: string; autoComplete?: string }) {
  return (
    <Field label={label} required={required} hint={hint} wide={wide} mark={mark}>
      <input name={name} type={type} required={required} defaultValue={value} placeholder={placeholder} autoComplete={autoComplete ?? "off"} className={inputClass} />
    </Field>
  );
}

function FileRow({ kind, label, required, current, labels }: { kind: FileKind; label: string; required: boolean; current?: ParticipantFileDoc; labels: ReturnType<typeof portalCopy> }) {
  const [chosen, setChosen] = useState("");
  const state = chosen ? "chosen" : current ? "uploaded" : required ? "missing" : "optional";
  return (
    <li className={cn("flex flex-col gap-3 rounded-sm border p-3 tablet:flex-row tablet:items-center", state === "missing" ? "border-line-accent bg-warning/30" : "border-line bg-surface")}>
      <span
        aria-hidden="true"
        className={cn(
          "grid size-[2.5rem] shrink-0 place-items-center rounded-sm",
          state === "uploaded" || state === "chosen" ? "bg-success text-on-success" : state === "missing" ? "bg-warning text-on-warning" : "bg-surface-overlay text-fg-muted",
        )}
      >
        <Icon name={state === "uploaded" || state === "chosen" ? "check" : kind === "photo" ? "camera" : "id"} size={20} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="type-body-s font-semibold text-fg">
          {label}
          {required && <span aria-hidden="true" className="ml-0.5 text-accent">*</span>}
        </span>
        <span className="truncate type-caption text-fg-muted">
          {chosen ? `${labels.chosen}: ${chosen}` : current ? (
            <a href={`/api/registration/file/${current.id}`} target="_blank" rel="noopener" className="text-link">
              {labels.uploaded}: {current.filename}
            </a>
          ) : required ? (
            labels.missing
          ) : (
            labels.optional
          )}
        </span>
      </span>
      <label className="inline-flex min-h-touch cursor-pointer items-center justify-center gap-2 rounded-xs border-2 border-action-ghost-border px-4 type-label text-fg focus-within:shadow-focus hover:bg-surface-2">
        <Icon name="download" size={16} className="rotate-180" />
        {current || chosen ? labels.replace : labels.choose}
        <input
          name={kind}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(event) => setChosen(event.currentTarget.files?.[0]?.name ?? "")}
          className="sr-only"
          aria-label={label}
        />
      </label>
    </li>
  );
}

export function ParticipantForm({
  locale,
  person,
  kind,
  sports,
  files,
  countryName,
  extraRequired = [],
}: {
  locale: Locale;
  person: ParticipantDoc;
  kind: ParticipantKind;
  sports: { id: string; name: string }[];
  files: ParticipantFileDoc[];
  countryName: string;
  extraRequired?: FileKind[];
}) {
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  const mark = { required: p.required, optional: p.optional };
  const [state, action, pending] = useActionState(saveParticipantForm, { errors: [], message: "" } satisfies FormState);
  const [dob, setDob] = useState(person.dateOfBirth);
  const [fn, setFn] = useState<string>(person.function);
  const minor = isMinor(dob);
  const required = new Set<FileKind>(["passport", "photo", ...(minor ? (["guardian"] as const) : []), ...extraRequired]);
  const onFile = (fileKind: FileKind) => files.find((file) => file.kind === fileKind);
  const errors = [...(state.message ? [state.message] : []), ...state.errors];

  return (
    <form action={action} className="flex flex-col gap-5" noValidate={false}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={state.id || person.id} />
      <input type="hidden" name="kind" value={kind} />

      <ErrorList title={p.fixThese} errors={errors} />

      <FormSection n={1} title={p.personal} help={p.personalHelp}>
        <Text label={copy.fullName} name="fullName" value={person.fullName} required wide mark={mark} autoComplete="name" />
        <Field label={copy.dateOfBirth} required mark={mark} hint={minor ? p.guardianHelpMinor : undefined}>
          <input name="dateOfBirth" type="date" required value={dob} onChange={(event) => setDob(event.currentTarget.value)} className={inputClass} />
        </Field>
        {kind === "athlete" ? (
          <Field label={copy.sex} required mark={mark}>
            <select name="sex" defaultValue={person.sex} required className={inputClass}>
              <option value="" disabled>
                —
              </option>
              <option value="female">{copy.female}</option>
              <option value="male">{copy.male}</option>
            </select>
          </Field>
        ) : (
          <Text label={copy.nationality} name="nationality" value={person.nationality} required mark={mark} />
        )}
        {kind === "athlete" && <Text label={copy.nationality} name="nationality" value={person.nationality} required mark={mark} />}
        <Field label={copy.countryRepresented} hint={copy.countryFixed}>
          <span className={cn(inputClass, "flex items-center gap-2 bg-surface-2 font-semibold")}>
            <Icon name="flag" size={16} className="text-fg-muted" /> {countryName}
          </span>
        </Field>
        <Text label={copy.documentNumber} name="documentNumber" value={person.documentNumber} required mark={mark} />
        <Text label={copy.documentExpiry} name="documentExpiry" value={person.documentExpiry} type="date" required mark={mark} />
      </FormSection>

      {kind === "athlete" ? (
        <FormSection n={2} title={p.sporting} help={p.sportingHelp}>
          <Field label={copy.sport} required mark={mark}>
            <select name="sportId" defaultValue={person.sportId} required className={inputClass}>
              <option value="" disabled>
                —
              </option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </Field>
          <Text label={copy.discipline} name="discipline" value={person.discipline} required mark={mark} />
          <Text label={copy.ageCategory} name="ageCategory" value={person.ageCategory} required mark={mark} />
          <Text label={copy.competitionCategory} name="competitionCategory" value={person.competitionCategory} required mark={mark} />
          <Text label={copy.federation} name="federation" value={person.federation} required wide mark={mark} />
          <Text label={copy.club} name="club" value={person.club} mark={mark} />
          <Text label={copy.jersey} name="jerseyNumber" value={person.jerseyNumber} mark={mark} />
          <Field label={copy.sportNotes} wide mark={mark}>
            <textarea name="sportNotes" defaultValue={person.sportNotes} rows={3} className={cn(inputClass, "py-2")} />
          </Field>
        </FormSection>
      ) : (
        <FormSection n={2} title={p.role} help={p.roleHelp}>
          <Field label={copy.function} required mark={mark}>
            <select name="function" value={fn} onChange={(event) => setFn(event.currentTarget.value)} required className={inputClass}>
              <option value="" disabled>
                —
              </option>
              {officialFunctions.map((item) => (
                <option key={item} value={item}>
                  {copy.functions[item]}
                </option>
              ))}
            </select>
          </Field>
          <Field label={copy.sport} mark={mark}>
            <select name="sportId" defaultValue={person.sportId} className={inputClass}>
              <option value="">—</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </Field>
          {fn === "other" && <Text label={copy.functionOther} name="functionOther" value={person.functionOther} required wide mark={mark} />}
        </FormSection>
      )}

      <FormSection n={3} title={p.contacts} help={p.contactsHelp}>
        {kind === "official" && (
          <>
            <Text label={copy.contactPhone} name="contactPhone" value={person.contactPhone} type="tel" required mark={mark} autoComplete="tel" />
            <Text label={copy.contactEmail} name="contactEmail" value={person.contactEmail} type="email" mark={mark} autoComplete="email" />
          </>
        )}
        <Text label={copy.emergencyName} name="emergencyName" value={person.emergencyName} required={kind === "athlete"} mark={mark} />
        <Text label={copy.emergencyPhone} name="emergencyPhone" value={person.emergencyPhone} type="tel" required={kind === "athlete"} mark={mark} />
        <Field label={copy.accessibility} wide mark={mark}>
          <textarea name="accessibility" defaultValue={person.accessibility} rows={2} className={cn(inputClass, "py-2")} />
        </Field>
      </FormSection>

      <FormSection n={4} title={p.guardian} help={minor ? p.guardianHelpMinor : p.guardianHelp} tone={minor ? "attention" : undefined}>
        <Text label={copy.guardianName} name="guardianName" value={person.guardianName} required={minor} mark={mark} />
        <Text label={copy.guardianContact} name="guardianContact" value={person.guardianContact} required={minor} mark={mark} />
      </FormSection>

      <FormSection n={5} title={copy.documents} help={p.documentsHelp}>
        <ul className="m-0 flex list-none flex-col gap-2 p-0 tablet:col-span-2">
          {fileKinds.map((fileKind) => (
            <FileRow key={fileKind} kind={fileKind} label={copy.files[fileKind]} required={required.has(fileKind)} current={onFile(fileKind)} labels={p} />
          ))}
        </ul>
      </FormSection>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-line bg-surface-raised/95 px-4 py-3 backdrop-blur tablet:mx-0 tablet:rounded-md tablet:border tablet:px-5 tablet:shadow-md desktop:flex-row desktop:items-center">
        <p className="m-0 flex-1 type-caption text-fg-muted">{p.submitHint}</p>
        <div className="grid grid-cols-2 gap-2 tablet:flex">
          <button type="submit" name="intent" value="save" formNoValidate disabled={pending} className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xs border-2 border-action-ghost-border px-5 type-label text-fg hover:bg-surface-2 disabled:opacity-50">
            {copy.save}
          </button>
          <button type="submit" name="intent" value="submit" disabled={pending} className="hover-overlay press inline-flex min-h-touch items-center justify-center gap-2 rounded-xs bg-action-primary px-5 type-label text-on-action-primary inset-ring-2 inset-ring-action-primary-edge disabled:opacity-50">
            <Icon name="send" size={16} /> {copy.submit}
          </button>
        </div>
      </div>
    </form>
  );
}
