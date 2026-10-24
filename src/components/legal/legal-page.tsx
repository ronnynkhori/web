import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { legalPages, type LegalSlug } from "@/data/legal";
import { PageHeader } from "@/components/layout/page-header";
import { isLocale, pick } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/page-metadata";

type Params = { params: Promise<{ locale: string }> };

/** Lines still waiting for official details are left off the page. */
const UNFILLED = /\[(CONTENT REQUIRED|ASSET REQUIRED|DECISION REQUIRED|CLIENT TO CONFIRM)/;

/** Privacy, cookies, accessibility, terms and contact share one layout. */
export function legalPage(slug: LegalSlug) {
  return async function LegalPage({ params }: Params) {
    const { locale } = await params;
    if (!isLocale(locale)) notFound();
    const dict = await getDictionary(locale);
    const page = legalPages[slug];
    const title = pick(page.title, locale);
    return (
      <article aria-labelledby="legal-title">
        <PageHeader
          id="legal-title"
          overline={dict.footer.legal}
          title={title}
          intro={<p className="m-0">{pick(page.intro, locale)}</p>}
          breadcrumbLabel={dict.pages.breadcrumb}
          crumbs={[
            { href: `/${locale}`, label: dict.pages.home },
            { href: `/${locale}/${slug}`, label: title },
          ]}
        />
        <div className="container-page py-8">
          <div className="flex max-w-prose flex-col gap-7">
          {page.sections.map((s) => {
            const lines = s.body[locale].filter((line) => !UNFILLED.test(line));
            if (lines.length === 0) return null;
            return (
              <section key={s.heading.en} className="flex flex-col gap-3">
                <h2 className="m-0 type-heading-m">{pick(s.heading, locale)}</h2>
                {lines.map((line) => (
                  <p key={line} className="m-0 type-body-m text-fg-2">
                    {line}
                  </p>
                ))}
              </section>
            );
          })}
          </div>
        </div>
      </article>
    );
  };
}

export function legalMetadata(slug: LegalSlug) {
  return async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { locale } = await params;
    if (!isLocale(locale)) return {};
    const dict = await getDictionary(locale);
    return pageMetadata(locale, `/${slug}`, pick(legalPages[slug].title, locale), dict.meta.title);
  };
}
