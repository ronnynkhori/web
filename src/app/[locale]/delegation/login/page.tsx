import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { DelegationLoginForm } from "@/components/registration/login-form";
import { demoImages } from "@/data/demo/images";
import { getSession } from "@/lib/admin/auth";
import { isLocale, pick } from "@/lib/i18n/config";
import { regCopy } from "@/lib/registration/copy";
import { portalCopy } from "@/lib/registration/portal-copy";

export default async function DelegationLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const session = await getSession();
  if (session?.role === "delegation" && session.countryCode) redirect(`/${locale}/delegation`);
  const copy = regCopy(locale);
  const p = portalCopy(locale);
  const steps = [p.step1, p.step2, p.step3];
  return (
    <section className="container-wide grid min-h-[calc(100svh-var(--header-h))] items-center gap-6 py-7 desktop:grid-cols-[minmax(0,30rem)_1fr] desktop:gap-7 desktop:py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="m-0 type-overline text-accent">{p.portal}</p>
          <h1 className="m-0 type-display-m">{copy.title}</h1>
          <p className="m-0 type-body-m text-fg-2">{copy.intro}</p>
        </div>
        <div className="rounded-md border border-line bg-surface-raised p-5 shadow-md tablet:p-6">
          <div aria-hidden="true" className="torch-stripe -mx-5 -mt-5 mb-5 h-1.5 rounded-t-md tablet:-mx-6 tablet:-mt-6 tablet:mb-6" />
          {session && session.role !== "delegation" && (
            <p className="m-0 mb-4 flex items-start gap-2 rounded-sm bg-warning px-3 py-2 type-body-s text-on-warning">
              <Icon name="alert" size={16} className="mt-0.5 shrink-0" /> {copy.noAccount}
            </p>
          )}
          <DelegationLoginForm locale={locale} email={copy.email} password={copy.password} enter={copy.enter} />
          <p className="m-0 mt-5 flex items-start gap-2 border-t border-line pt-4 type-caption text-fg-muted">
            <Icon name="info" size={16} className="shrink-0" /> {p.help}
          </p>
        </div>
      </div>
      <div data-theme="dark" className="relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-md bg-surface text-fg shadow-lg desktop:h-full desktop:max-h-[44rem]">
        <Image src={demoImages.karate.src} alt={pick(demoImages.karate.alt, locale)} fill sizes="(min-width: 64rem) 55vw, 100vw" className="-z-10 object-cover object-[center_20%]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-surface from-30% via-surface/55 to-transparent" />
        <div className="flex flex-col gap-5 p-6 tablet:p-6">
          <h2 className="m-0 type-heading-m">{p.stepsTitle}</h2>
          <ol className="m-0 grid list-none gap-4 p-0 tablet:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} className="flex flex-col gap-2">
                <span className="grid size-[2.25rem] place-items-center rounded-pill bg-action-secondary font-display text-lg text-on-action-secondary">{index + 1}</span>
                <span className="type-body-s text-fg-2">{step}</span>
              </li>
            ))}
          </ol>
          <p className="m-0 flex items-center gap-2 border-t border-line pt-4 type-caption text-fg-2">
            <Icon name="shield" size={16} className="text-accent" /> {p.secure}
          </p>
        </div>
      </div>
    </section>
  );
}
