/**
 * Field definitions for every content collection the Control Room edits with
 * the generic list/edit screens. Fields are plain data so they can be passed to
 * client form components; behaviour (titles, badges) stays on the server.
 */
import { countries } from "@/data/countries";
import { sports } from "@/data/sports";
import type { IconName } from "@/components/ui/icon";
import { locales, pick, type Locale, type Localized } from "@/lib/i18n/config";
import type { Collection } from "@/lib/store/types";
import { intlLocale, translator, type Translate } from "./i18n/translate";
import type { Area } from "./roles";

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "textarea"
  | "url"
  | "number"
  | "date"
  | "datetime"
  | "time"
  | "checkbox"
  | "select"
  | "tags"
  | "localized"
  | "localizedText"
  | "localizedLines"
  | "image"
  | "file"
  | "link";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: FieldOption[];
  /** Upload folder for image/file fields. */
  folder?: string;
  /** Checkbox that must be ticked before saving (e.g. photo consent). */
  mustBeTrue?: boolean;
  /** Form card the field sits in; inferred from name/type when omitted. */
  section?: "banner" | "details" | "site" | "media" | "publishing" | "more";
}

export interface Badge {
  label: string;
  tone: "success" | "warning" | "info" | "neutral" | "error";
}

type Doc = Record<string, unknown>;

export interface CollectionDef {
  id: Collection;
  area: Area;
  label: string;
  singular: string;
  description: string;
  icon: IconName;
  idPrefix: string;
  fields: FieldDef[];
  defaults: () => Doc;
  title: (doc: Doc) => string;
  /** `t` and `locale` give the Control Room language; both default to English. */
  subtitle?: (doc: Doc, t?: Translate, locale?: Locale) => string;
  badges?: (doc: Doc, t?: Translate, locale?: Locale) => Badge[];
  orderable?: boolean;
  /** Where the content appears on the public site. */
  publicAnchor: string;
}

const en = (value: unknown) => (value as Localized | undefined)?.en ?? "";
const inLocale = (value: unknown, locale: Locale) => (value ? (pick(value as Localized, locale) ?? "") : "");
const emptyL = (): Localized => ({ en: "", pt: "", fr: "" });

export const sportOptions: FieldOption[] = sports.map((s) => ({ value: s.id, label: s.name.en }));
export const countryOptions: FieldOption[] = countries.map((c) => ({ value: c.code, label: c.name.en }));

const publishOptions: FieldOption[] = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft (hidden)" },
];

const contentStatusOptions: FieldOption[] = [
  { value: "confirmed", label: "Confirmed" },
  { value: "source", label: "From the Chef de Mission manual" },
  { value: "required", label: "Information still to come" },
  { value: "conflict", label: "Sources disagree" },
];

const toneOptions: FieldOption[] = [
  { value: "energy", label: "Red" },
  { value: "region", label: "Green" },
  { value: "highlight", label: "Yellow" },
  { value: "premium", label: "Gold" },
  { value: "neutral", label: "Neutral" },
];

const tierOptions: FieldOption[] = [
  { value: "principal", label: "Principal partner" },
  { value: "official", label: "Official partner" },
  { value: "supporters", label: "Supporter" },
];

const english = translator("en");

const statusBadge = (doc: Doc, t: Translate): Badge[] =>
  doc.status === "draft" ? [{ label: t("Draft"), tone: "neutral" }] : [{ label: t("Published"), tone: "success" }];

const sportName = (id: unknown, locale: Locale = "en") => {
  const sport = sports.find((s) => s.id === id);
  return sport ? pick(sport.name, locale) : "";
};

function formatDate(iso: unknown, locale: Locale = "en"): string {
  if (typeof iso !== "string" || !iso) return "";
  return new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Luanda" }).format(new Date(iso));
}

const optionLabel = (options: FieldOption[], value: unknown, t: Translate) => {
  const label = options.find((o) => o.value === value)?.label;
  return label ? t(label) : "";
};

export const collectionDefs: CollectionDef[] = [
  {
    id: "announcements",
    area: "announcements",
    label: "Announcements",
    singular: "announcement",
    description: "Official notices with deadlines, who they apply to and one action. Pin the most important one.",
    icon: "megaphone",
    idPrefix: "ann",
    publicAnchor: "#news",
    fields: [
      { name: "title", label: "Title", type: "localized", required: true },
      { name: "body", label: "Notice text", type: "localizedText", required: true },
      { name: "kind", label: "Type", type: "select", required: true, options: [
        { value: "important", label: "Important" },
        { value: "deadline", label: "Deadline" },
        { value: "update", label: "Update" },
        { value: "notice", label: "Notice" },
      ] },
      { name: "audience", label: "Applies to", type: "localized", required: true, help: "For example: National team managers, Everyone." },
      { name: "ref", label: "Reference number", type: "text", help: "Optional. Printed on the notice, e.g. LOC/2026/015." },
      { name: "publishedAt", label: "Issue date", type: "date", help: "Optional. Leave empty if the notice has no issue date." },
      { name: "deadline", label: "Key date", type: "date", help: "Optional. Shown as “Closes …” on deadlines and “Date …” on other notices." },
      { name: "pinned", label: "Pin to the top of the board", type: "checkbox" },
      { name: "action", label: "Action button", type: "link", help: "Optional link, e.g. #guide or a form URL." },
      { name: "status", label: "Status", type: "select", required: true, options: publishOptions },
      { name: "publishAt", label: "Publish at (Luanda time)", type: "datetime", help: "Leave empty to publish immediately." },
      { name: "expiresAt", label: "Hide after (Luanda time)", type: "datetime" },
    ],
    defaults: () => ({ kind: "notice", status: "published", title: emptyL(), body: emptyL(), audience: emptyL(), publishedAt: new Date().toISOString().slice(0, 10) }),
    title: (d) => en(d.title),
    subtitle: (d, t = english, locale = "en") =>
      [
        d.ref,
        d.publishedAt && t("issued {date}", { date: formatDate(d.publishedAt, locale) }),
        d.deadline && t(d.kind === "deadline" ? "closes {date}" : "date {date}", { date: formatDate(d.deadline, locale) }),
      ]
        .filter(Boolean)
        .join(" · "),
    badges: (d, t = english, locale = "en") => [
      ...statusBadge(d, t),
      ...(d.pinned ? [{ label: t("Pinned"), tone: "warning" as const }] : []),
      ...(d.publishAt && Date.parse(String(d.publishAt)) > Date.now()
        ? [{ label: t("Scheduled {date}", { date: formatDate(d.publishAt, locale) }), tone: "info" as const }]
        : []),
    ],
  },
  {
    id: "documents",
    area: "documents",
    label: "Documents",
    singular: "document",
    description: "Downloadable PDFs in the Games guide. Replacing the file keeps the same entry, so links stay valid.",
    icon: "download",
    idPrefix: "doc",
    publicAnchor: "#guide",
    orderable: true,
    fields: [
      { name: "title", label: "Title", type: "localized", required: true },
      { name: "file", label: "File (PDF)", type: "file", folder: "documents", help: "Up to 50 MB. Leave empty to show “Coming soon”." },
      { name: "language", label: "Languages", type: "text", required: true, help: "e.g. EN · PT · FR" },
      { name: "version", label: "Version", type: "text", help: "e.g. 1.2. Shown next to the size." },
      { name: "status", label: "Status", type: "select", required: true, options: publishOptions },
    ],
    defaults: () => ({ title: emptyL(), fileType: "PDF", size: "", language: "EN", href: null, status: "published" }),
    title: (d) => en(d.title),
    subtitle: (d) => `${d.fileType ?? "PDF"}${d.size ? ` · ${d.size}` : ""} · ${d.language ?? ""}${d.version ? ` · v${d.version}` : ""}`,
    badges: (d, t = english) => [...statusBadge(d, t), ...(d.href ? [] : [{ label: t("No file yet"), tone: "warning" as const }])],
  },
  {
    id: "media",
    area: "media",
    label: "Gallery photos",
    singular: "photo",
    description: "Photos shown in “Today in photos”. Every photo needs a credit and confirmed consent. If none are published, the original placeholder photos are shown.",
    icon: "camera",
    idPrefix: "photo",
    publicAnchor: "#media",
    orderable: true,
    fields: [
      { name: "image", label: "Photo", type: "image", required: true, folder: "gallery", help: "Resized to 2400 px and compressed in your browser before upload." },
      { name: "title", label: "Caption", type: "localized", required: true },
      { name: "credit", label: "Photographer credit", type: "text", required: true },
      { name: "type", label: "Type", type: "select", required: true, options: [{ value: "photo", label: "Photo" }, { value: "video", label: "Video (thumbnail)" }] },
      { name: "ratio", label: "Shape in the gallery", type: "select", required: true, options: [
        { value: "landscape", label: "Landscape" },
        { value: "portrait", label: "Portrait" },
        { value: "square", label: "Square" },
      ] },
      { name: "videoSrc", label: "Video URL", type: "url", help: "Only for videos." },
      { name: "sportId", label: "Sport", type: "select", options: sportOptions },
      { name: "countryCode", label: "Country", type: "select", options: countryOptions },
      { name: "day", label: "Day", type: "date" },
      { name: "consent", label: "Consent confirmed for every athlete shown (safeguarding policy)", type: "checkbox", mustBeTrue: true },
      { name: "status", label: "Status", type: "select", required: true, options: publishOptions },
    ],
    defaults: () => ({ type: "photo", ratio: "landscape", tone: "neutral", status: "published", consent: false, title: emptyL(), credit: "" }),
    title: (d) => en(d.title),
    subtitle: (d, _t, locale = "en") => [d.credit, sportName(d.sportId, locale), formatDate(d.day, locale)].filter(Boolean).join(" · "),
    badges: (d, t = english) => [...statusBadge(d, t), ...(d.consent ? [] : [{ label: t("No consent"), tone: "error" as const }])],
  },
  {
    id: "photoLinks",
    area: "photoLinks",
    label: "Photo downloads",
    singular: "gallery link",
    description: "Pixieset galleries for each day or sport. They appear as buttons under “Download your Games photos”.",
    icon: "image",
    idPrefix: "gal",
    publicAnchor: "#media",
    orderable: true,
    fields: [
      { name: "label", label: "Button label", type: "localized", required: true, help: "e.g. Day 3 · Athletics" },
      { name: "url", label: "Pixieset gallery URL", type: "url", required: true },
      { name: "day", label: "Day", type: "date" },
      { name: "sportId", label: "Sport", type: "select", options: sportOptions },
    ],
    defaults: () => ({ label: emptyL(), url: "" }),
    title: (d) => en(d.label),
    subtitle: (d) => String(d.url ?? ""),
  },
  {
    id: "sponsors",
    area: "sponsors",
    label: "Sponsors",
    singular: "sponsor",
    description: "Partner logos by tier. Empty tier slots stay as placeholders.",
    icon: "star",
    idPrefix: "sp",
    publicAnchor: "#partners",
    orderable: true,
    fields: [
      { name: "name", label: "Partner name", type: "text", required: true },
      { name: "tier", label: "Tier", type: "select", required: true, options: tierOptions },
      { name: "logo", label: "Logo", type: "image", folder: "sponsors", help: "PNG or SVG with a transparent background." },
      { name: "url", label: "Website", type: "url" },
    ],
    defaults: () => ({ tier: "official", name: "" }),
    title: (d) => String(d.name ?? ""),
    subtitle: (d, t = english) => optionLabel(tierOptions, d.tier, t) || String(d.tier ?? ""),
  },
  {
    id: "faq",
    area: "faq",
    label: "FAQ & chatbot",
    singular: "answer",
    description: "Questions the “Ask a question” assistant can answer. Keywords decide which answer is picked.",
    icon: "chat",
    idPrefix: "faq",
    publicAnchor: "#top",
    orderable: true,
    fields: [
      { name: "question", label: "Question", type: "localized", required: true },
      { name: "answer", label: "Answer", type: "localizedText", required: true },
      { name: "keywords", label: "Keywords", type: "tags", required: true, help: "Comma-separated, in all three languages. e.g. tickets, bilhetes, billets" },
      { name: "link", label: "Link under the answer", type: "link" },
    ],
    defaults: () => ({ question: emptyL(), answer: emptyL(), keywords: [] }),
    title: (d) => en(d.question),
    subtitle: (d) => ((d.keywords as string[] | undefined) ?? []).slice(0, 6).join(", "),
  },
  {
    id: "guide",
    area: "guide",
    label: "Games guide",
    singular: "guide topic",
    description: "Practical information topics. Each line becomes one bullet point.",
    icon: "info",
    idPrefix: "guide",
    publicAnchor: "#guide",
    orderable: true,
    fields: [
      { name: "title", label: "Topic", type: "localized", required: true },
      { name: "body", label: "Bullet points (one per line)", type: "localizedLines", required: true },
      { name: "status", label: "Information status", type: "select", required: true, options: contentStatusOptions },
    ],
    defaults: () => ({ title: emptyL(), body: { en: [], pt: [], fr: [] }, status: "confirmed" }),
    title: (d) => en(d.title),
    subtitle: (d, t = english) => optionLabel(contentStatusOptions, d.status, t),
  },
  {
    id: "venues",
    area: "venues",
    label: "Venues",
    singular: "venue",
    description: "Venue cards in “Where the Games happen”.",
    icon: "pin",
    idPrefix: "venue",
    publicAnchor: "#venues",
    orderable: true,
    fields: [
      { name: "name", label: "Name", type: "localized", required: true },
      { name: "role", label: "Role / headline", type: "localized", required: true },
      { name: "sports", label: "Sports hosted", type: "localized", help: "Use — when no sport is hosted." },
      { name: "area", label: "Area", type: "localized", required: true },
      { name: "address", label: "Street address", type: "text", help: "Optional. Shown on the card with a map link." },
      {
        name: "mapUrl",
        label: "Map link",
        type: "url",
        help: "Optional. A Google Maps or OpenStreetMap link. Left empty, the address is searched on OpenStreetMap.",
      },
      { name: "accessibility", label: "Accessibility", type: "localized", help: "Optional. Step-free access, accessible seating, parking." },
      { name: "image", label: "Photo", type: "image", folder: "venues", help: "Leave empty to keep showing the current placeholder photo." },
      { name: "tone", label: "Placeholder colour", type: "select", options: toneOptions },
      { name: "status", label: "Information status", type: "select", required: true, options: contentStatusOptions },
    ],
    defaults: () => ({ name: emptyL(), role: emptyL(), sports: { en: "—", pt: "—", fr: "—" }, area: emptyL(), tone: "region", status: "confirmed" }),
    title: (d) => en(d.name),
    subtitle: (d, _t, locale = "en") => inLocale(d.area, locale),
  },
  {
    id: "countries",
    area: "countries",
    label: "Countries",
    singular: "country",
    description: "Participating nations: the country cards, the “follow your nation” picker, the hero flag row and the countries count. Untick “Participating” to hide a delegation.",
    icon: "globe",
    idPrefix: "nation",
    publicAnchor: "#countries",
    orderable: true,
    fields: [
      { name: "code", label: "Country code", type: "text", required: true, help: "Three letters (ISO), e.g. MOZ. Must match the code used in scores and results." },
      { name: "name", label: "Name", type: "localized", required: true },
      { name: "participating", label: "Participating in CPLP 2027", type: "checkbox" },
      { name: "isHost", label: "Host nation", type: "checkbox" },
      { name: "delegationSize", label: "Delegation size", type: "text", help: "e.g. 148 athletes · 40 officials. Leave empty while unconfirmed." },
      { name: "sportsEntered", label: "Sports entered", type: "text", help: "e.g. 9 of 11. Leave empty while unconfirmed." },
      { name: "membership", label: "Information status", type: "select", required: true, options: contentStatusOptions },
      { name: "flag", label: "Flag", type: "image", folder: "flags", help: "Leave empty to use the built-in flag for the nine CPLP nations." },
    ],
    defaults: () => ({ code: "", name: emptyL(), participating: true, isHost: false, membership: "confirmed", delegationSize: "", sportsEntered: "" }),
    title: (d) => `${en(d.name)} (${String(d.code ?? "").toUpperCase()})`,
    subtitle: (d, t = english) =>
      [d.delegationSize, d.sportsEntered && t("{n} sports", { n: String(d.sportsEntered) })].filter(Boolean).join(" · ") ||
      t("Delegation not confirmed yet"),
    badges: (d, t = english) => [
      ...(d.participating === false ? [{ label: t("Not participating"), tone: "neutral" as const }] : [{ label: t("Participating"), tone: "success" as const }]),
      ...(d.isHost ? [{ label: t("Host"), tone: "info" as const }] : []),
    ],
  },
  {
    id: "schedule",
    area: "schedule",
    label: "Schedule",
    singular: "session",
    description: "Competition sessions shown in the Games guide, grouped by day.",
    icon: "calendar",
    idPrefix: "ses",
    publicAnchor: "#guide",
    fields: [
      { name: "date", label: "Date", type: "date", required: true },
      { name: "time", label: "Start time (Luanda)", type: "time", required: true },
      { name: "sportId", label: "Sport", type: "select", required: true, options: sportOptions },
      { name: "event", label: "Event / session", type: "localized", required: true },
      { name: "venue", label: "Venue", type: "localized", required: true },
    ],
    defaults: () => ({ date: "2026-12-05", time: "09:00", sportId: "athletics", event: emptyL(), venue: emptyL() }),
    title: (d) => `${sportName(d.sportId)} · ${en(d.event)}`,
    subtitle: (d, _t, locale = "en") => `${formatDate(d.date, locale)} · ${d.time ?? ""} · ${inLocale(d.venue, locale)}`,
  },
];

export function getCollectionDef(id: string): CollectionDef | undefined {
  return collectionDefs.find((c) => c.id === id);
}

/** Localised fields whose PT or FR text is still empty. */
export function missingTranslations(def: CollectionDef, doc: Doc): string[] {
  const missing = new Set<string>();
  for (const field of def.fields) {
    if (!["localized", "localizedText", "localizedLines"].includes(field.type)) continue;
    const value = doc[field.name] as Localized<string | string[]> | undefined;
    if (!value) continue;
    const enValue = value.en;
    if (!enValue || (Array.isArray(enValue) && !enValue.length)) continue;
    for (const l of locales) {
      if (l === "en") continue;
      const v = value[l];
      if (!v || (Array.isArray(v) && !v.length)) missing.add(l.toUpperCase());
    }
  }
  return [...missing];
}
