import "server-only";
import { getStore } from "@/lib/store";
import type { StoredDoc } from "@/lib/store/types";
import type { FileKind } from "./model";

export type ExtraFile = Extract<FileKind, "eligibility" | "medical" | "other">;

export interface SportQuota {
  men: number;
  women: number;
  staff: number;
  judges: number;
}

export interface RegistrationRulesDoc extends StoredDoc {
  extraRequired: ExtraFile[];
  quotas: Record<string, SportQuota>;
}

const empty = (): RegistrationRulesDoc => ({ id: "rules", extraRequired: [], quotas: {} });

export async function loadRegistrationRules(): Promise<RegistrationRulesDoc> {
  const list = await getStore().list<RegistrationRulesDoc>("registrationRules");
  return list?.find((item) => item.id === "rules") ?? empty();
}

export async function saveRegistrationRules(doc: RegistrationRulesDoc, actor: string): Promise<void> {
  await getStore().put("registrationRules", { ...doc, id: "rules" }, actor);
}
