import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { getSession } from "@/lib/admin/auth";
import { PortalHeader } from "@/components/registration/portal/portal-header";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { loadDelegation } from "@/lib/registration/data";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Signed-in, per-officer pages: they render on request, so they may block instead of prerendering a static shell. */
export const instant = false;

async function Banner({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const session = await getSession();
  if (session?.role !== "delegation" || !session.countryCode) return null;
  const delegation = await loadDelegation(session.countryCode);
  return <PortalHeader locale={locale as Locale} countryCode={session.countryCode} officerName={session.name} institution={delegation?.institution} />;
}

export default function DelegationLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  return (
    <div className="min-h-svh bg-surface-2 pt-(--header-h) print:bg-surface print:pt-0">
      <Suspense fallback={<div data-theme="dark" className="h-40 bg-surface" />}>
        <Banner params={params} />
      </Suspense>
      <Suspense fallback={<section className="container-wide py-8" />}>{children}</Suspense>
    </div>
  );
}
