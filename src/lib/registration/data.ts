import "server-only";
import { loadItems, newId } from "@/lib/admin/mutate";
import { getStore } from "@/lib/store";
import type { DelegationDoc, ParticipantDoc, ParticipantFileDoc, RegistrationNoticeDoc } from "./model";

async function all<T extends DelegationDoc | ParticipantDoc | ParticipantFileDoc | RegistrationNoticeDoc>(collection: "delegations" | "participants" | "participantFiles" | "registrationNotices"): Promise<T[]> {
  return (await loadItems<T>(collection)) ?? [];
}

export async function loadDelegations(): Promise<DelegationDoc[]> {
  return all<DelegationDoc>("delegations");
}

export async function loadDelegation(countryCode: string): Promise<DelegationDoc | null> {
  return (await loadDelegations()).find((item) => item.countryCode === countryCode) ?? null;
}

export async function loadParticipants(): Promise<ParticipantDoc[]> {
  return all<ParticipantDoc>("participants");
}

export async function loadFiles(): Promise<ParticipantFileDoc[]> {
  return all<ParticipantFileDoc>("participantFiles");
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
