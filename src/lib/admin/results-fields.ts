import { sports } from "@/data/sports";
import { matchSportIds } from "@/lib/live/scoring";
import type { FieldDef, FieldOption } from "./schemas";

export function matchFields(countryOptions: FieldOption[], venueOptions: FieldOption[]): FieldDef[] {
  return [
    {
      name: "sportId",
      label: "Sport",
      type: "select",
      required: true,
      options: sports.filter((s) => matchSportIds.includes(s.id)).map((s) => ({ value: s.id, label: s.name.en })),
    },
    { name: "round", label: "Round", type: "localized", required: true, help: "For example: Group A, Semi-final, Final." },
    { name: "home", label: "Home team", type: "select", required: true, options: countryOptions },
    { name: "away", label: "Away team", type: "select", required: true, options: countryOptions },
    {
      name: "startsAt",
      label: "Start time (Luanda time)",
      type: "datetime",
      section: "more",
      help: "Leave empty if the time is not set yet. The match still shows on the site as upcoming.",
    },
    { name: "venueId", label: "Venue", type: "select", options: venueOptions, section: "more" },
  ];
}

export function adjustmentFields(countryOptions: FieldOption[]): FieldDef[] {
  return [
    { name: "countryCode", label: "Country", type: "select", required: true, options: countryOptions },
    { name: "gold", label: "Gold", type: "number", help: "Use a negative number to remove a medal." },
    { name: "silver", label: "Silver", type: "number" },
    { name: "bronze", label: "Bronze", type: "number" },
    {
      name: "reason",
      label: "Reason",
      type: "text",
      required: true,
      help: "Shown in the activity log, e.g. “Team event medal, results sheet 14”.",
    },
  ];
}
