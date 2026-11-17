import { Icon } from "@/components/ui/icon";
import type { Locale } from "@/lib/i18n/config";
import { regCopy } from "@/lib/registration/copy";
import type { ParticipantDoc } from "@/lib/registration/model";
import { portalCopy } from "@/lib/registration/portal-copy";
import { canEdit, isMinor } from "@/lib/registration/rules";
import { StatusPill } from "./status-pill";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

/** Participant rows: a card per person on phones, a compact table-like list from tablet up. */
export function PeopleList({ people, locale, sportName }: { people: ParticipantDoc[]; locale: Locale; sportName: (id: string) => string }) {
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  return (
    <ul className="m-0 flex list-none flex-col divide-y divide-line overflow-hidden rounded-md border border-line bg-surface-raised p-0">
      {people.map((person) => {
        const detail =
          person.kind === "athlete"
            ? [sportName(person.sportId), person.discipline && person.discipline !== "—" ? person.discipline : ""].filter(Boolean).join(" · ")
            : [person.function ? copy.functions[person.function] : "", sportName(person.sportId)].filter(Boolean).join(" · ");
        return (
          <li key={person.id}>
            <a href={`/${locale}/delegation/participants/${person.id}`} className="group flex items-center gap-4 px-4 py-3.5 transition-colors duration-ui hover:bg-surface-2 tablet:px-5">
              <span aria-hidden="true" className={`grid size-[2.75rem] shrink-0 place-items-center rounded-pill font-display text-base ${person.kind === "athlete" ? "bg-action-secondary text-on-action-secondary" : "bg-surface-inverse text-fg-on-inverse"}`}>
                {initials(person.fullName)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="truncate type-body-m font-semibold text-fg group-hover:text-link">{person.fullName || "—"}</span>
                  {isMinor(person.dateOfBirth) && <span className="rounded-xs bg-surface-overlay px-1.5 type-caption font-bold text-fg-2">U18</span>}
                </span>
                <span className="truncate type-caption text-fg-muted">
                  {person.kind === "athlete" ? copy.athlete : copy.official}
                  {detail ? ` · ${detail}` : ""}
                  {person.registrationNumber ? ` · ${person.registrationNumber}` : ""}
                </span>
                <StatusPill status={person.status} label={copy.status[person.status]} className="mt-1 self-start tablet:hidden" />
              </span>
              <StatusPill status={person.status} label={copy.status[person.status]} className="max-tablet:hidden" />
              <span className="hidden items-center gap-1 type-label text-link tablet:inline-flex">
                {canEdit(person.status) ? p.edit : p.view}
                <Icon name="chevron-right" size={16} />
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
