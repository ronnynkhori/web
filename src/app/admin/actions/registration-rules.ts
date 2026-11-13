"use server";

import { redirect } from "next/navigation";
import { sports } from "@/data/sports";
import { requireUser } from "@/lib/admin/auth";
import { audit } from "@/lib/admin/mutate";
import { getStore } from "@/lib/store";
import type { ExtraFile, SportQuota } from "@/lib/registration/settings";
import { saveRegistrationRules } from "@/lib/registration/settings";

const extras: ExtraFile[] = ["eligibility", "medical", "other"];

export async function saveRegistrationRulesForm(form: FormData): Promise<void> {
  const session = await requireUser("registrations");
  if (!getStore().writable) redirect("/admin/registration-rules?readonly=1");
  const extraRequired = form.getAll("extra").map(String).filter((value): value is ExtraFile => extras.includes(value as ExtraFile));
  const quotas: Record<string, SportQuota> = {};
  for (const sport of sports) {
    const num = (group: keyof SportQuota) => {
      const value = Number(form.get(`${sport.id}-${group}`));
      return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
    };
    quotas[sport.id] = { men: num("men"), women: num("women"), staff: num("staff"), judges: num("judges") };
  }
  await saveRegistrationRules({ id: "rules", extraRequired, quotas }, session.email);
  await audit(session, "updated registration rules", "registrationRules", "rules", extraRequired.join(", ") || "passport and photo only");
  redirect("/admin/registration-rules?saved=1");
}
