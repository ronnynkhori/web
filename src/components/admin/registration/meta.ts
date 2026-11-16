import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import { pick, type Locale } from "@/lib/i18n/config";
import type { RegistrationStatus } from "@/lib/registration/model";
import type { Tone } from "../status-badge";

export const registrationStatuses: RegistrationStatus[] = ["submitted", "review", "correction", "approved", "rejected", "draft"];

/** English keys; the Control Room catalogue translates them. */
export const statusLabel: Record<RegistrationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  review: "Under review",
  correction: "Correction required",
  approved: "Approved",
  rejected: "Rejected",
};

export const statusTone: Record<RegistrationStatus, Tone> = {
  draft: "neutral",
  submitted: "info",
  review: "warning",
  correction: "warning",
  approved: "success",
  rejected: "error",
};

/** Solid colours for the pipeline bar, in status order. */
export const statusBar: Record<RegistrationStatus, string> = {
  draft: "bg-muted-foreground/30",
  submitted: "bg-[color-mix(in_oklab,var(--tk-color-brand-blue)_45%,white)]",
  review: "bg-highlight",
  correction: "bg-[color-mix(in_oklab,var(--tk-color-brand-yellow)_55%,var(--tk-color-brand-red))]",
  approved: "bg-success-foreground",
  rejected: "bg-primary",
};

export const countryName = (code: string, locale: Locale) =>
  pick(countries.find((item) => item.code === code)?.name ?? { en: code, pt: code }, locale);

export const sportName = (id: string, locale: Locale) =>
  id ? pick(sports.find((item) => item.id === id)?.name ?? { en: id, pt: id }, locale) : "";

export const isWaiting = (status: RegistrationStatus) => status === "submitted" || status === "review";

/** Oldest submission first, so nobody waits longest. */
export const byQueue = <T extends { submittedAt?: string; _updatedAt?: string }>(a: T, b: T) =>
  (a.submittedAt ?? a._updatedAt ?? "").localeCompare(b.submittedAt ?? b._updatedAt ?? "");
