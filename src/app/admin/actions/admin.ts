"use server";

import { createClient } from "@supabase/supabase-js";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { isDemoDoc } from "@/lib/live/demo-mode";
import { requireUser } from "@/lib/admin/auth";
import { getT } from "@/lib/admin/i18n/server";
import type { Translate } from "@/lib/admin/i18n/translate";
import { audit, deleteDoc, ensureSeeded, loadItems, newId, saveDoc } from "@/lib/admin/mutate";
import { parseFields } from "@/lib/admin/parse";
import { roles } from "@/lib/admin/roles";
import { hashPassword } from "@/lib/admin/session";
import { settingsFields, userFields } from "@/lib/admin/settings-fields";
import { defaultSettings, seedableCollections, seedFor } from "@/lib/cms/seed";
import type { AnnouncementDoc, BannerLevel, CountryDoc, Role, SettingsDoc, UserDoc, VenueDoc } from "@/lib/cms/types";
import { retiredSamples } from "@/data/news";
import type { Localized } from "@/lib/i18n/config";
import type { Phase } from "@/lib/phase";
import { getStore, supabaseConfig, type Collection, type StoredDoc } from "@/lib/store";
import type { FormState } from "./content";

const errorMessage = (error: unknown, t: Translate) => (error instanceof Error ? error.message : t("Something went wrong. Try again."));

export async function saveSettings(_prev: FormState, form: FormData): Promise<FormState> {
  const session = await requireUser("settings");
  const t = await getT();
  const { values, errors } = parseFields(settingsFields, form);
  const message = values.bannerMessage as Localized;
  if (values.bannerEnabled && !message.en) errors.bannerMessage = t("Write the alert in English before switching it on.");
  if (Object.keys(errors).length) return { errors, message: t("Please fix the highlighted fields.") };

  const link = values.bannerLink as { href: string; label: Localized } | undefined;
  const current = (await loadItems<SettingsDoc>("settings"))[0] ?? defaultSettings;
  const next: SettingsDoc = {
    ...defaultSettings,
    ...current,
    id: "site",
    phase: (values.phase as "auto" | Phase | undefined) ?? "auto",
    photoDownloadsUrl: (values.photoDownloadsUrl as string | undefined) ?? null,
    banner: {
      enabled: Boolean(values.bannerEnabled),
      level: ((values.bannerLevel as BannerLevel | undefined) ?? "info"),
      message,
      href: link?.href ?? "",
      linkLabel: link?.label ?? { en: "", pt: "", fr: "" },
    },
  };
  try {
    await saveDoc("settings", next, session, "updated", next.banner.enabled ? `Banner on: ${message.en}` : "Site settings");
  } catch (error) {
    return { message: errorMessage(error, t) };
  }
  redirect("/admin/settings?saved=1");
}

/** Copies the current built-in site content into the database (skips anything already there). */
export async function loadSiteContent(): Promise<void> {
  const session = await requireUser("settings");
  if (session.role !== "super") redirect("/admin/settings?denied=1");
  if (!getStore().writable) redirect("/admin/settings?readonly=1");
  let added = 0;
  for (const collection of seedableCollections) {
    const existing = await ensureSeeded(collection, session.email);
    // Guide topics and FAQ answers added to the site later are appended; edited ones are left alone.
    if (collection !== "guide" && collection !== "faq") continue;
    const have = new Set(existing.map((d) => d.id));
    const missing = seedFor(collection).filter((d) => !have.has(d.id));
    for (const [i, doc] of missing.entries()) await getStore().put(collection, { ...doc, _order: existing.length + i }, session.email);
    added += missing.length;
    if (missing.length) updateTag(collection);
  }
  await audit(session, "loaded site content", undefined, undefined, `${seedableCollections.length} collections, ${added} new guide/FAQ items`);
  redirect("/admin/settings?seeded=1");
}

/** Built-in ids the site no longer ships; a refresh removes them. */
const retiredIds: Partial<Record<Collection, string[]>> = {
  venues: ["competition-venues", "athletes-village"],
  guide: ["accessibility"],
  faq: ["tickets", "accessibility", "volunteer", "partners"],
  announcements: Object.keys(retiredSamples),
};

/**
 * Overwrites the built-in guide topics, FAQ answers, announcements, venues and
 * nations with the copy shipped in the code (the Chef de Mission manual
 * content). Items an editor added stay, after the built-in ones. Uploaded
 * photos and flags, venue addresses and map links, delegation figures and
 * announcement publishing settings are kept.
 */
export async function refreshManualContent(): Promise<void> {
  const session = await requireUser("settings");
  if (session.role !== "super") redirect("/admin/settings?denied=1");
  const store = getStore();
  if (!store.writable) redirect("/admin/settings?readonly=1");
  const collections = ["guide", "faq", "announcements", "venues", "countries"] as const;
  let updated = 0;
  for (const collection of collections) {
    const existing = (await store.list<StoredDoc>(collection)) ?? [];
    const byId = new Map(existing.map((d) => [d.id, d]));
    const seeds = seedFor<StoredDoc>(collection);
    const seedIds = new Set(seeds.map((d) => d.id));
    const retired = new Set(retiredIds[collection] ?? []);
    const merged = seeds.map((seed) => keepEdits(collection, seed, byId.get(seed.id)));
    const custom = existing.filter((d) => !seedIds.has(d.id) && !retired.has(d.id));
    const next = [...merged, ...custom].map((d, i) => ({ ...d, _order: i }));
    await store.replaceAll(collection, next, session.email);
    updated += merged.length;
    updateTag(collection);
  }
  await audit(session, "refreshed manual content", undefined, undefined, `${updated} built-in guide, FAQ, announcement, venue and nation items`);
  redirect("/admin/settings?refreshed=1");
}

function keepEdits(collection: Collection, seed: StoredDoc, current: StoredDoc | undefined): StoredDoc {
  if (!current) return seed;
  if (collection === "venues") {
    const [s, c] = [seed as VenueDoc, current as VenueDoc];
    const uploaded = c.image?.src && c.image.src !== s.image?.src;
    return {
      ...s,
      image: uploaded ? c.image : s.image,
      address: c.address || s.address,
      mapUrl: c.mapUrl || s.mapUrl,
      accessibility: c.accessibility ?? s.accessibility,
    } as StoredDoc;
  }
  if (collection === "announcements") {
    const c = current as AnnouncementDoc;
    return { ...seed, status: c.status, publishAt: c.publishAt, expiresAt: c.expiresAt } as StoredDoc;
  }
  if (collection === "countries") {
    const [s, c] = [seed as CountryDoc, current as CountryDoc];
    return {
      ...s,
      flag: c.flag?.src ? c.flag : s.flag,
      participating: c.participating,
      delegationSize: c.delegationSize || s.delegationSize,
      sportsEntered: c.sportsEntered || s.sportsEntered,
    } as StoredDoc;
  }
  return seed;
}

/**
 * Removes simulated scores, results and medal adjustments so only real entries
 * remain. Empty collections are written as empty, which also switches the public
 * hub off the demo feed.
 */
export async function clearDemoResults(): Promise<void> {
  const session = await requireUser("settings");
  if (session.role !== "super") redirect("/admin/settings?denied=1");
  const store = getStore();
  if (!store.writable) redirect("/admin/settings?readonly=1");
  let removed = 0;
  for (const collection of ["matches", "results", "medalAdjustments"] as const) {
    const docs = (await store.list(collection)) ?? [];
    const kept = docs.filter((d) => !isDemoDoc(d));
    removed += docs.length - kept.length;
    await store.replaceAll(collection, kept, session.email);
  }
  updateTag("live");
  await audit(session, "cleared demo results", undefined, undefined, `${removed} demo items removed`);
  redirect("/admin/settings?cleared=1");
}

async function createSupabaseLogin(email: string, password: string, t: Translate): Promise<string | null> {
  const config = supabaseConfig();
  if (!config) return t("Supabase is not configured.");
  const client = createClient(config.url, config.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await client.auth.admin.createUser({ email, password, email_confirm: true });
  if (!error) return null;
  if (/already/i.test(error.message)) {
    const { data } = await client.auth.admin.listUsers({ perPage: 1000 });
    const existing = data?.users.find((u) => u.email?.toLowerCase() === email);
    if (!existing) return error.message;
    const { error: updateError } = await client.auth.admin.updateUserById(existing.id, { password });
    return updateError?.message ?? null;
  }
  return error.message;
}

export async function saveUser(id: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  const session = await requireUser("users");
  const t = await getT();
  const { values, errors } = parseFields(userFields(id === null), form);
  const email = String(values.email ?? "").toLowerCase();
  const password = String(values.password ?? "");
  const role = values.role as Role;
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.email = t("Enter a valid email address.");
  if (password && password.length < 10) errors.password = t("Use at least 10 characters.");
  if (!roles.includes(role)) errors.role = t("Choose a role.");

  const users = await loadItems<UserDoc>("users");
  const existing = id ? users.find((u) => u.id === id) : undefined;
  if (!existing && users.some((u) => u.email === email)) errors.email = t("A user with this email already exists.");
  if (Object.keys(errors).length) return { errors, message: t("Please fix the highlighted fields.") };

  try {
    const store = getStore();
    let passwordHash = existing?.passwordHash;
    if (password) {
      if (store.kind === "supabase") {
        const failure = await createSupabaseLogin(email, password, t);
        if (failure) return { message: t("Could not set the login: {error}", { error: failure }) };
      } else {
        passwordHash = await hashPassword(password);
      }
    }
    const sportId = values.sportId as string | undefined;
    const user: UserDoc = {
      id: existing?.id ?? newId("user"),
      email: existing?.email ?? email,
      name: String(values.name ?? ""),
      role,
      sportIds: sportId ? [sportId] : [],
      active: existing?.active ?? true,
      passwordHash: store.kind === "supabase" ? undefined : passwordHash,
    };
    await saveDoc("users", user, session, existing ? "updated" : "created", `${user.name} (${user.role})`);
  } catch (error) {
    return { message: errorMessage(error, t) };
  }
  redirect("/admin/users?saved=1");
}

export async function setUserActive(id: string, active: boolean): Promise<void> {
  const session = await requireUser("users");
  const user = (await loadItems<UserDoc>("users")).find((u) => u.id === id);
  if (!user || user.email === session.email) return;
  await saveDoc("users", { ...user, active }, session, active ? "reactivated" : "deactivated", user.email);
}

/** Only deactivated accounts can be removed, so nobody is locked out by one click. */
export async function deleteUser(id: string): Promise<void> {
  const session = await requireUser("users");
  const user = (await loadItems<UserDoc>("users")).find((u) => u.id === id);
  if (!user || user.email === session.email || user.active) return;
  await deleteDoc("users", id, session, user.email);
  redirect("/admin/users?deleted=1");
}
