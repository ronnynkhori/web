import "server-only";
import { countries as builtIn } from "@/data/countries";
import type { CountryDoc, VenueDoc } from "@/lib/cms/types";
import { pick, type Localized } from "@/lib/i18n/config";
import { getAdminLocale, getT } from "./i18n/server";
import { loadItems } from "./mutate";
import type { FieldOption } from "./schemas";

export interface AdminCountry {
  code: string;
  name: Localized;
  participating: boolean;
}

/** Countries from the Control Room (built-in list until edited), for forms and validation. */
export async function getAdminCountries(): Promise<AdminCountry[]> {
  const docs = await loadItems<CountryDoc>("countries");
  const list = docs.map((c) => ({ code: c.code.toUpperCase(), name: c.name, participating: c.participating !== false }));
  // Codes already used in scores and results stay valid even if a country is later removed.
  for (const c of builtIn) if (!list.some((x) => x.code === c.code)) list.push({ code: c.code, name: c.name, participating: false });
  return list;
}

export async function getCountryOptions(): Promise<FieldOption[]> {
  const [locale, t] = await Promise.all([getAdminLocale(), getT()]);
  return (await getAdminCountries()).map((c) => {
    const name = pick(c.name, locale);
    return { value: c.code, label: c.participating ? name : t("{country} (not participating)", { country: name }) };
  });
}

export async function getAdminVenues(): Promise<Array<{ id: string; name: Localized }>> {
  return (await loadItems<VenueDoc>("venues")).map((v) => ({ id: v.id, name: v.name }));
}

export async function getVenueOptions(): Promise<FieldOption[]> {
  const locale = await getAdminLocale();
  return (await getAdminVenues()).map((v) => ({ value: v.id, label: pick(v.name, locale) }));
}
