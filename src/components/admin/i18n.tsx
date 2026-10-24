"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useTransition, type ReactNode } from "react";
import { Languages } from "lucide-react";
import { ADMIN_LANG_COOKIE, translator, type Translate } from "@/lib/admin/i18n/translate";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { NativeSelect } from "./ui/native-select";

const LocaleContext = createContext<Locale>("en");

/** Gives client components the Control Room language chosen on the server. */
export function AdminI18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export const useAdminLocale = () => useContext(LocaleContext);

export function useT(): Translate {
  const locale = useContext(LocaleContext);
  return useMemo(() => translator(locale), [locale]);
}

/** EN / PT / FR picker for the Control Room; the choice is kept for a year on this device. */
export function AdminLanguageSwitch({ className, tone = "default" }: { className?: string; tone?: "default" | "dark" }) {
  const locale = useAdminLocale();
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <label className={cn("relative inline-flex shrink-0 items-center", pending && "opacity-60", className)}>
      <span className="sr-only">{t("Control Room language")}</span>
      <Languages className={cn("pointer-events-none absolute left-2.5 z-10 size-4", tone === "dark" ? "text-white/80" : "text-muted-foreground")} aria-hidden="true" />
      <NativeSelect
        value={locale}
        disabled={pending}
        onChange={(e) => {
          document.cookie = `${ADMIN_LANG_COOKIE}=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
          startTransition(() => router.refresh());
        }}
        wrapperClassName="w-auto shrink-0"
        className={cn("h-9 pl-8 text-sm font-semibold md:h-8", tone === "dark" && "border-white/30 bg-white/10 text-white")}
      >
        {locales.map((l) => (
          <option key={l} value={l} className="text-foreground">
            {localeNames[l]}
          </option>
        ))}
      </NativeSelect>
    </label>
  );
}
