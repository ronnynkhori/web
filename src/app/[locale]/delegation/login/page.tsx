import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/auth";
import { DelegationLoginForm } from "@/components/registration/login-form";
import { demoImages } from "@/data/demo/images";
import { isLocale, pick } from "@/lib/i18n/config";
import { regCopy } from "@/lib/registration/copy";
import { notFound } from "next/navigation";

export default async function DelegationLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const session = await getSession();
  if (session?.role === "delegation" && session.countryCode) redirect(`/${locale}/delegation`);
  const copy = regCopy(locale);
  return (
    <section className="container-wide grid min-h-[calc(100svh-var(--header-h))] items-center gap-10 py-12 desktop:grid-cols-[minmax(0,28rem)_1fr] desktop:items-stretch desktop:py-16">
      <div className="flex max-w-md flex-col gap-5 desktop:self-center">
        <h1 className="m-0 type-display-m">{copy.title}</h1>
        <p className="m-0 type-body text-fg-2">{copy.intro}</p>
        {session && session.role !== "delegation" && <p className="m-0 type-body-s text-accent">{copy.noAccount}</p>}
        <DelegationLoginForm locale={locale} email={copy.email} password={copy.password} enter={copy.enter} />
      </div>
      <div className="relative hidden overflow-hidden desktop:block">
        <Image
          src={demoImages.karate.src}
          alt={pick(demoImages.karate.alt, locale)}
          fill
          sizes="46vw"
          className="object-cover object-[center_18%]"
        />
      </div>
    </section>
  );
}
