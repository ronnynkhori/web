import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { DelegationLoginForm } from "@/components/registration/login-form";
import { signOutDelegation } from "@/lib/registration/actions";
import { demoImages } from "@/data/demo/images";
import { getSession } from "@/lib/admin/auth";
import { isLocale, pick } from "@/lib/i18n/config";
import { demoOfficerEnabled } from "@/lib/registration/demo-account";
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
  const wrongRole = Boolean(session && session.role !== "delegation");

  return (
    <section className="container-wide grid gap-6 py-6 tablet:gap-7 tablet:py-7 desktop:min-h-[calc(100svh-var(--header-h))] desktop:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] desktop:items-start desktop:gap-8 desktop:py-8 large:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-2 tablet:gap-3">
          <p className="m-0 type-overline text-accent">{p.portal}</p>
          <h1 className="m-0 type-heading-xl tablet:type-display-m">{copy.title}</h1>
          <p className="m-0 max-w-prose type-body-s text-fg-2 tablet:type-body-m">{copy.intro}</p>
        </div>

        <div className="rounded-md border border-line bg-surface-raised p-4 tablet:p-5 desktop:p-6">
          <div aria-hidden="true" className="torch-stripe -mx-4 -mt-4 mb-4 h-1.5 rounded-t-md tablet:-mx-5 tablet:-mt-5 tablet:mb-5 desktop:-mx-6 desktop:-mt-6 desktop:mb-6" />
          {wrongRole && (
            <div className="mb-4 flex flex-col gap-3 rounded-sm bg-warning px-3 py-3 text-on-warning">
              <p className="m-0 flex items-start gap-2 type-body-s">
                <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                <span>{copy.noAccount}</span>
              </p>
              <form action={signOutDelegation}>
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="press inline-flex min-h-touch items-center gap-2 rounded-xs border border-current/30 bg-transparent px-3 type-label">
                  {copy.signOut} <Icon name="arrow-right" size={14} />
                </button>
              </form>
            </div>
          )}
          <DelegationLoginForm locale={locale} email={copy.email} password={copy.password} enter={copy.enter} />
          {demoOfficerEnabled() && (
            <p className="m-0 mt-4 break-all rounded-sm bg-surface-2 px-3 py-2 type-caption text-fg-2">
              <span className="font-semibold">{p.demoLogin}</span>
            </p>
          )}
          <p className="m-0 mt-5 flex items-start gap-2 border-t border-line pt-4 type-caption text-fg-muted">
            <Icon name="info" size={16} className="shrink-0" /> {p.help}
          </p>
        </div>
      </div>

      <aside
        data-theme="dark"
        className="relative isolate flex min-h-[18rem] flex-col justify-end overflow-hidden rounded-md border border-line bg-surface text-fg tablet:min-h-[22rem] desktop:min-h-[32rem] desktop:self-stretch"
      >
        <Image
          src={demoImages.karate.src}
          alt={pick(demoImages.karate.alt, locale)}
          fill
          sizes="(min-width: 64rem) 55vw, 100vw"
          className="-z-10 object-cover object-[center_18%]"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-surface from-25% via-surface/60 to-transparent" />
        <div className="flex flex-col gap-4 p-4 tablet:gap-5 tablet:p-5 desktop:p-6">
          <h2 className="m-0 type-heading-s tablet:type-heading-m">{p.stepsTitle}</h2>
          <ol className="m-0 grid list-none gap-3 p-0 tablet:grid-cols-3 tablet:gap-4">
            {steps.map((step, index) => (
              <li key={step} className="flex flex-col gap-2">
                <span className="grid size-[2rem] place-items-center rounded-pill bg-action-secondary font-display text-base text-on-action-secondary tablet:size-[2.25rem] tablet:text-lg">
                  {index + 1}
                </span>
                <span className="type-body-s text-fg-2">{step}</span>
              </li>
            ))}
          </ol>
          <p className="m-0 flex items-center gap-2 border-t border-line pt-4 type-caption text-fg-2">
            <Icon name="shield" size={16} className="shrink-0 text-accent" /> {p.secure}
          </p>
        </div>
      </aside>
    </section>
  );
}
