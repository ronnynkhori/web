import "server-only";
import { cookies, headers } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import { ADMIN_LANG_COOKIE, adminLocaleFrom, localeFromHeader, translator, type Translate } from "./translate";

/** The signed-in person's Control Room language: their choice, else their browser's. */
export async function getAdminLocale(): Promise<Locale> {
  const chosen = adminLocaleFrom((await cookies()).get(ADMIN_LANG_COOKIE)?.value);
  return chosen ?? localeFromHeader((await headers()).get("accept-language"));
}

export async function getT(): Promise<Translate> {
  return translator(await getAdminLocale());
}
