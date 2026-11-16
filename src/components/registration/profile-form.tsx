"use client";

import { useActionState } from "react";
import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/lib/i18n/config";
import { saveDelegationProfile, type FormState } from "@/lib/registration/actions";
import { regCopy } from "@/lib/registration/copy";
import type { DelegationDoc } from "@/lib/registration/model";
import { portalCopy } from "@/lib/registration/portal-copy";
import { ErrorList, Field, FormSection, inputClass } from "./portal/fields";

export function ProfileForm({
  locale,
  delegation,
  sports,
  countryName,
}: {
  locale: Locale;
  delegation: DelegationDoc | null;
  sports: { id: string; name: string }[];
  countryName: string;
}) {
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  const mark = { required: p.required, optional: p.optional };
  const [state, action, pending] = useActionState(saveDelegationProfile, { errors: [], message: "" } satisfies FormState);
  const selected = new Set(delegation?.sports ?? []);
  const errors = [...(state.message ? [state.message] : []), ...state.errors];
  const text = (name: keyof DelegationDoc, label: string, required = false, type = "text", wide = false) => (
    <Field label={label} required={required} mark={mark} wide={wide}>
      <input name={name} type={type} required={required} defaultValue={String(delegation?.[name] ?? "")} className={inputClass} />
    </Field>
  );
  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      <ErrorList title={p.fixThese} errors={errors} />

      <FormSection n={1} title={p.institutionSection} help={p.profileIntro}>
        <Field label={copy.countryRepresented} hint={copy.countryFixed}>
          <span className={`${inputClass} flex items-center gap-2 bg-surface-2 font-semibold`}>
            <Icon name="flag" size={16} className="text-fg-muted" /> {countryName}
          </span>
        </Field>
        {text("institution", copy.institution, true, "text")}
        {text("headName", copy.headName, true)}
        {text("headPosition", copy.headPosition)}
      </FormSection>

      <FormSection n={2} title={p.contactSection}>
        {text("email", copy.email, true, "email")}
        {text("telephone", copy.telephone, true, "tel")}
        {text("officerName", copy.officerName, true)}
        {text("officerContact", copy.officerContact)}
      </FormSection>

      <FormSection n={3} title={p.sportsSection} help={p.sportsHelp}>
        <fieldset className="m-0 grid grid-cols-1 gap-2 border-0 p-0 tablet:col-span-2 tablet:grid-cols-2 desktop:grid-cols-3">
          <legend className="sr-only">{copy.sports}</legend>
          {sports.map((sport) => (
            <label
              key={sport.id}
              className="group flex min-h-touch cursor-pointer items-center gap-3 rounded-sm border border-line-strong bg-surface px-3 transition-colors duration-ui hover:border-fg-muted has-checked:border-transparent has-checked:bg-surface-inverse has-checked:text-fg-on-inverse has-focus-visible:shadow-focus"
            >
              <input type="checkbox" name="sports" value={sport.id} defaultChecked={selected.has(sport.id)} className="peer sr-only" />
              <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center rounded-xs border-2 border-current opacity-60 peer-checked:border-action-secondary peer-checked:bg-action-secondary peer-checked:text-on-action-secondary peer-checked:opacity-100">
                <Icon name="check" size={16} className="hidden group-has-checked:block" />
              </span>
              <span className="type-body-s font-semibold">{sport.name}</span>
            </label>
          ))}
        </fieldset>
      </FormSection>

      <FormSection n={4} title={p.sizeSection} help={p.sizeHelp}>
        {text("estimatedAthletes", copy.estimatedAthletes, false, "number")}
        {text("estimatedOfficials", copy.estimatedOfficials, false, "number")}
      </FormSection>

      <div className="sticky bottom-0 z-10 -mx-4 flex justify-end border-t border-line bg-surface-raised/95 px-4 py-3 backdrop-blur tablet:mx-0 tablet:rounded-md tablet:border tablet:px-5 tablet:shadow-md">
        <button type="submit" disabled={pending} className="hover-overlay press inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-xs bg-action-primary px-6 type-label text-on-action-primary inset-ring-2 inset-ring-action-primary-edge disabled:opacity-50 tablet:w-auto">
          <Icon name="check" size={16} /> {p.saveProfile}
        </button>
      </div>
    </form>
  );
}
