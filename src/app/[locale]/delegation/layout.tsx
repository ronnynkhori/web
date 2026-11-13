import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { getSession } from "@/lib/admin/auth";
import { OfficerBar } from "@/components/registration/officer-bar";
import { isLocale, type Locale } from "@/lib/i18n/config";

export const metadata: Metadata = { robots: { index: false, follow: false } };

async function Bar({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const session = await getSession();
  if (session?.role !== "delegation") return null;
  return <OfficerBar locale={locale as Locale} />;
}

export default function DelegationLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  return (
    <div className="pt-(--header-h)">
      <Suspense fallback={null}>
        <Bar params={params} />
      </Suspense>
      <Suspense fallback={<section className="container-wide py-8" />}>{children}</Suspense>
    </div>
  );
}
