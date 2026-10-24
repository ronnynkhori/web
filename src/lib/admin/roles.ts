import type { Role } from "@/lib/cms/types";

export const roles: Role[] = ["super", "editor", "media", "results", "scorer"];

export const roleLabels: Record<Role, string> = {
  super: "Super admin",
  editor: "Communications editor",
  media: "Media manager",
  results: "Results manager",
  scorer: "Venue scorer",
};

export const roleDescriptions: Record<Role, string> = {
  super: "Everything, including users and site settings.",
  editor: "Announcements, guide, FAQ, documents, venues, countries, schedule, sponsors and the alert banner.",
  media: "Gallery photos, photo download links and highlights.",
  results: "Approves and corrects results, manages fixtures, countries, the medal table and schedule.",
  scorer: "Enters scores for assigned sports from a phone. Cannot publish final results.",
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
  | "activity";

const everyone = roles;

export const access: Record<Area, Role[]> = {
  dashboard: everyone,
  announcements: ["super", "editor"],
  documents: ["super", "editor"],
  faq: ["super", "editor"],
  guide: ["super", "editor"],
  venues: ["super", "editor"],
  countries: ["super", "editor", "results"],
  sponsors: ["super", "editor"],
  schedule: ["super", "editor", "results"],
  settings: ["super", "editor"],
  media: ["super", "media"],
  photoLinks: ["super", "media"],
  users: ["super"],
  activity: ["super", "results"],
  scores: ["super", "results", "scorer"],
  results: ["super", "results", "scorer"],
  approvals: ["super", "results"],
  medals: ["super", "results"],
};

export function can(role: Role, area: Area): boolean {
  return access[area].includes(role);
}

/** Roles that may publish final scores and results without approval. */
export function canApprove(role: Role): boolean {
  return role === "super" || role === "results";
}
