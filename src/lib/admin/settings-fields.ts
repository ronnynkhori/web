import type { SettingsDoc, UserDoc } from "@/lib/cms/types";
import { roleLabels, roles } from "./roles";
import { sportOptions, type FieldDef } from "./schemas";

export const settingsFields: FieldDef[] = [
  {
    name: "phase",
    label: "What the home page shows",
    type: "select",
    required: true,
    options: [
      { value: "auto", label: "Automatic: follows the Games calendar" },
      { value: "pre", label: "Before the Games (countdown)" },
      { value: "live", label: "Games time (live hub first)" },
      { value: "post", label: "After the Games (recap)" },
    ],
    help: "Leave on Automatic. A fixed phase is for previews and presentations.",
    section: "site",
  },
  {
    name: "photoDownloadsUrl",
    label: "Main photo download gallery",
    type: "url",
    help: "Link to the full-resolution gallery (Pixieset, Flickr, Google Drive). Leave empty to hide the button.",
    section: "site",
  },
  {
    name: "bannerEnabled",
    label: "Show the alert banner across the top of the site",
    type: "checkbox",
    help: "Use for time-critical information: weather delays, venue changes, transport disruption.",
    section: "banner",
  },
  {
    name: "bannerLevel",
    label: "Alert level",
    type: "select",
    required: true,
    section: "banner",
    options: [
      { value: "info", label: "Information (green)" },
      { value: "warning", label: "Warning (yellow)" },
      { value: "alert", label: "Urgent (red)" },
    ],
  },
  { name: "bannerMessage", label: "Alert message", type: "localized", help: "One short sentence.", section: "banner" },
  { name: "bannerLink", label: "Alert link (optional)", type: "link", section: "banner" },
];

export function settingsValues(s: SettingsDoc): Record<string, unknown> {
  return {
    phase: s.phase,
    photoDownloadsUrl: s.photoDownloadsUrl ?? "",
    bannerEnabled: s.banner.enabled,
    bannerLevel: s.banner.level,
    bannerMessage: s.banner.message,
    bannerLink: s.banner.href ? { href: s.banner.href, label: s.banner.linkLabel } : undefined,
  };
}

export function userFields(isNew: boolean): FieldDef[] {
  return [
    { name: "name", label: "Full name", type: "text", required: true },
    {
      name: "email",
      label: "Email (used to sign in)",
      type: "email",
      required: isNew,
      help: isNew ? undefined : "The sign-in email cannot be changed. Deactivate this user and create a new one instead.",
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      required: true,
      options: roles.map((r) => ({ value: r, label: roleLabels[r] })),
    },
    {
      name: "sportId",
      label: "Assigned sport (scorers)",
      type: "select",
      options: sportOptions,
      help: "Venue scorers only see matches for this sport. Leave empty for all sports.",
    },
    {
      name: "password",
      label: isNew ? "Temporary password" : "Set a new password",
      type: "password",
      required: isNew,
      help: isNew
        ? "At least 10 characters. Share it privately; the person can be given a new one here at any time."
        : "Forgot their password? Type a new one (at least 10 characters), save, then share it privately. Leave empty to keep the current one.",
    },
  ];
}

export function userValues(u: UserDoc | undefined): Record<string, unknown> {
  return u ? { name: u.name, email: u.email, role: u.role, sportId: u.sportIds[0] ?? "" } : { role: "editor", sportId: "" };
}
