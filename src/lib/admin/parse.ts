import { normalise } from "@/lib/faq-match";
import { locales, type Localized } from "@/lib/i18n/config";
import { translator, type Translate } from "./i18n/translate";
import type { FieldDef } from "./schemas";

/** Luanda is UTC+1 all year (no daylight saving). */
const MAPUTO_OFFSET = "+01:00";

export function isoToMaputoInput(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + 1 * 3_600_000).toISOString().slice(0, 16);
}

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

function localized(form: FormData, name: string): Localized {
  return Object.fromEntries(locales.map((l) => [l, str(form, `${name}.${l}`)])) as Localized;
}

function validUrl(value: string): boolean {
  return /^(https?:\/\/|#|\/)/.test(value);
}

export type FieldErrors = Record<string, string>;

/** Turns a submitted form into document fields and collects validation errors. */
export function parseFields(
  fields: FieldDef[],
  form: FormData,
  t: Translate = translator("en"),
): { values: Record<string, unknown>; errors: FieldErrors } {
  const values: Record<string, unknown> = {};
  const errors: FieldErrors = {};

  for (const field of fields) {
    const { name } = field;
    switch (field.type) {
      case "localized":
      case "localizedText": {
        const value = localized(form, name);
        values[name] = value;
        if (field.required && !value.en) errors[name] = t("English text is required.");
        break;
      }
      case "localizedLines": {
        const value = Object.fromEntries(
          locales.map((l) => [l, str(form, `${name}.${l}`).split(/\r?\n/).map((s) => s.trim()).filter(Boolean)]),
        ) as Localized<string[]>;
        values[name] = value;
        if (field.required && !value.en.length) errors[name] = t("Add at least one English line.");
        break;
      }
      case "tags": {
        const value = [...new Set(str(form, name).split(/[,\n]/).map((s) => normalise(s).trim()).filter(Boolean))];
        values[name] = value;
        if (field.required && !value.length) errors[name] = t("Add at least one keyword.");
        break;
      }
      case "checkbox": {
        const value = form.get(name) === "on";
        values[name] = value;
        if (field.mustBeTrue && !value) errors[name] = t("This must be confirmed before saving.");
        break;
      }
      case "number": {
        const raw = str(form, name);
        values[name] = raw === "" ? undefined : Number(raw);
        if (field.required && raw === "") errors[name] = t("Required.");
        break;
      }
      case "datetime": {
        const raw = str(form, name);
        values[name] = raw ? new Date(`${raw}:00${MAPUTO_OFFSET}`).toISOString() : undefined;
        if (field.required && !raw) errors[name] = t("Required.");
        break;
      }
      case "image": {
        const src = str(form, `${name}.src`);
        values[name] = src
          ? {
              src,
              width: Number(str(form, `${name}.width`)) || 1600,
              height: Number(str(form, `${name}.height`)) || 1200,
              alt: localized(form, `${name}.alt`),
              credit: str(form, `${name}.credit`) || undefined,
            }
          : undefined;
        if (field.required && !src) errors[name] = t("Upload an image.");
        break;
      }
      case "file": {
        const href = str(form, `${name}.href`);
        values.href = href || null;
        values.size = str(form, `${name}.size`);
        values.fileType = str(form, `${name}.fileType`) || "PDF";
        if (field.required && !href) errors[name] = t("Upload a file.");
        break;
      }
      case "link": {
        const href = str(form, `${name}.href`);
        const label = localized(form, `${name}.label`);
        values[name] = href ? { href, label, external: /^https?:\/\//.test(href) } : undefined;
        if (href && !validUrl(href)) errors[name] = t("Use a full URL (https://…) or a page anchor (#guide).");
        else if (href && !label.en) errors[name] = t("Add an English button label.");
        break;
      }
      default: {
        const value = str(form, name);
        values[name] = value || undefined;
        if (field.required && !value) errors[name] = t("Required.");
        else if (field.type === "url" && value && !validUrl(value)) errors[name] = t("Use a full URL starting with https://");
        else if (field.type === "time" && value && !/^\d{2}:\d{2}$/.test(value)) errors[name] = t("Use HH:MM, e.g. 09:30.");
      }
    }
  }
  return { values, errors };
}
