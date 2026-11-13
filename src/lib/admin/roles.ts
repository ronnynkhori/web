import type { Role } from "@/lib/cms/types";

export const roles: Role[] = ["super", "editor", "media", "results", "scorer", "delegation", "registrar"];

export const roleLabels: Record<Role, string> = {
  super: "Super admin",
  editor: "Communications editor",
  media: "Media manager",
  results: "Results manager",
  scorer: "Venue scorer",
  delegation: "Delegation officer",
  registrar: "Registration reviewer",
};

/** Roles a Super admin can assign. The games-console roles stay in the type so older accounts still load. */
export const assignableRoles: Role[] = ["super", "registrar", "delegation"];

export const roleDescriptions: Record<Role, string> = {
  super: "Creates one officer account per country and can review every registration.",
  editor: "Announcements, guide, FAQ, documents, venues, countries, schedule, sponsors and the alert banner.",
  media: "Gallery photos, photo download links and highlights.",
  results: "Approves and corrects results, manages fixtures, countries, the medal table and schedule.",
  scorer: "Enters scores for assigned sports from a phone. Cannot publish final results.",
  delegation: "Registers one country's athletes and officials. Cannot open the Control Room.",
  registrar: "Reviews, approves and returns delegation registrations.",
};

export type Area =
  | "dashboard"
  | "announcements"
  | "documents"
  | "media"
  | "photoLinks"
  | "sponsors"
  | "faq"
  | "guide"
  | "venues"
  | "countries"
  | "schedule"
  | "settings"
  | "users"
  | "scores"
  | "results"
  | "approvals"
  | "medals"
  | "activity"
  | "registrations";

const committee = ["super", "registrar"] as const satisfies readonly Role[];

export const access: Record<Area, Role[]> = {
  dashboard: [...committee],
  announcements: [],
  documents: [],
  faq: [],
  guide: [],
  venues: [],
  countries: [],
  sponsors: [],
  schedule: [],
  settings: [],
  media: [],
  photoLinks: [],
  users: ["super"],
  activity: [...committee],
  scores: [],
  results: [],
  approvals: [],
  medals: [],
  registrations: [...committee],
};

export function can(role: Role, area: Area): boolean {
  return access[area].includes(role);
}

/** Roles that may publish final scores and results without approval. */
export function canApprove(role: Role): boolean {
  return role === "super" || role === "results";
}
