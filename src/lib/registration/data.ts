import "server-only";
import { loadItems, newId } from "@/lib/admin/mutate";
import { getStore } from "@/lib/store";
import { demoDelegations, demoFiles, demoParticipants } from "./demo";
import type { DelegationDoc, ParticipantDoc, ParticipantFileDoc, RegistrationNoticeDoc } from "./model";

async function all<T extends DelegationDoc | ParticipantDoc | ParticipantFileDoc | RegistrationNoticeDoc>(collection: "delegations" | "participants" | "participantFiles" | "registrationNotices"): Promise<T[]> {
  return (await loadItems<T>(collection)) ?? [];
}

/**
 * True when nothing real is stored yet. The Control Room and the Angola demo
 * officer then see labelled sample records. A writable but empty Supabase
 * project still qualifies — saves stay blocked while samples are showing.
 */
export async function registrationDemoActive(): Promise<boolean> {
  if (process.env.DEMO_DATA === "0") return false;
  const [people, delegations] = await Promise.all([all<ParticipantDoc>("participants"), all<DelegationDoc>("delegations")]);
  return people.length === 0 && delegations.length === 0;
}

export async function loadDelegations(): Promise<DelegationDoc[]> {
  const real = await all<DelegationDoc>("delegations");
  return real.length === 0 && (await registrationDemoActive()) ? demoDelegations : real;
}

export async function loadDelegation(countryCode: string): Promise<DelegationDoc | null> {
  return (await loadDelegations()).find((item) => item.countryCode === countryCode) ?? null;
}

export async function loadParticipants(): Promise<ParticipantDoc[]> {
  const real = await all<ParticipantDoc>("participants");
  return real.length === 0 && (await registrationDemoActive()) ? demoParticipants : real;
}

export async function loadFiles(): Promise<ParticipantFileDoc[]> {
  const real = await all<ParticipantFileDoc>("participantFiles");
  return real.length === 0 && (await registrationDemoActive()) ? demoFiles : real;
}

export async function loadNotices(): Promise<RegistrationNoticeDoc[]> {
  return all<RegistrationNoticeDoc>("registrationNotices");
}

export async function saveDelegation(doc: DelegationDoc, actor: string): Promise<void> {
  await getStore().put("delegations", doc, actor);
}

export async function saveParticipant(doc: ParticipantDoc, actor: string): Promise<void> {
  await getStore().put("participants", doc, actor);
}

export async function saveFile(doc: ParticipantFileDoc, actor: string): Promise<void> {
  const files = await loadFiles();
  const previous = files.find((file) => file.participantId === doc.participantId && file.kind === doc.kind);
  if (previous && previous.id !== doc.id) await getStore().remove("participantFiles", previous.id);
  await getStore().put("participantFiles", doc, actor);
}

export async function saveNotice(doc: RegistrationNoticeDoc, actor: string): Promise<void> {
  await getStore().put("registrationNotices", doc, actor);
}

export function freshId(prefix: string): string {
  return newId(prefix);
}
