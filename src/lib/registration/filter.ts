import type { ParticipantDoc, RegistrationStatus } from "./model";
import { normaliseDocument } from "./rules";

export type StatusFilter = RegistrationStatus | "waiting" | "";

export interface RegistrationFilter {
  q: string;
  country: string;
  sport: string;
  kind: "" | "athlete" | "official";
  status: StatusFilter;
}

const statuses = ["draft", "submitted", "review", "correction", "approved", "rejected", "waiting"];

/** Reads list filters from search params (page) or a URL (export routes). */
export function readFilter(get: (name: string) => string | null | undefined): RegistrationFilter {
  const value = (name: string) => String(get(name) ?? "").trim();
  const kind = value("kind");
  const status = value("status");
  return {
    q: value("q").slice(0, 80),
    country: /^[A-Z]{3}$/.test(value("country")) ? value("country") : "",
    sport: /^[a-z0-9-]{1,40}$/.test(value("sport")) ? value("sport") : "",
    kind: kind === "athlete" || kind === "official" ? kind : "",
    status: statuses.includes(status) ? (status as StatusFilter) : "",
  };
}

export function matchesStatus(person: ParticipantDoc, status: StatusFilter): boolean {
  if (!status) return true;
  if (status === "waiting") return person.status === "submitted" || person.status === "review";
  return person.status === status;
}

/** Everything except the status, so the status tabs can count within the other filters. */
export function applyFilter(people: ParticipantDoc[], filter: RegistrationFilter, withStatus = true): ParticipantDoc[] {
  const needle = filter.q.toLowerCase();
  const doc = normaliseDocument(filter.q);
  return people.filter((person) => {
    if (filter.country && person.countryCode !== filter.country) return false;
    if (filter.sport && person.sportId !== filter.sport) return false;
    if (filter.kind && person.kind !== filter.kind) return false;
    if (withStatus && !matchesStatus(person, filter.status)) return false;
    if (needle) {
      const hay = `${person.fullName} ${person.registrationNumber}`.toLowerCase();
      if (!hay.includes(needle) && !(doc && normaliseDocument(person.documentNumber).includes(doc))) return false;
    }
    return true;
  });
}

export function filterQuery(filter: Partial<RegistrationFilter>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) if (value) params.set(key, String(value));
  const text = params.toString();
  return text ? `?${text}` : "";
}
