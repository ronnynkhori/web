import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { actionHref, keyDateLabel, KindTag, longDate } from "@/components/news/news-section";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getAnnouncements } from "@/lib/cms/read";
import { isLocale, pick } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/page-metadata";

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateStaticParams() {
  return (await getAnnouncements()).map((a) => ({ id: a.id }));
}

async function find(id: string) {
  return (await getAnnouncements()).find((a) => a.id === id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const item = await find(id);
  if (!isLocale(locale) || !item) return {};
  const dict = await getDictionary(locale);
  return pageMetadata(locale, `/news/${item.id}`, pick(item.title, locale), dict.meta.title, pick(item.body, locale));
}

export default async function AnnouncementPage({ params }: Props) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const [dict, item] = await Promise.all([getDictionary(locale), find(id)]);
  if (!item) notFound();
  const n = dict.news;
  const format = longDate(locale);
  const title = pick(item.title, locale);

  return (
    <article aria-labelledby="notice-title">
      <PageHeader
        id="notice-title"
        overline={n.kinds[item.kind]}
        meta={
          (item.publishedAt || item.deadline) && (
            <span className="text-fg-2">
              {[
                item.publishedAt && `${n.issued} ${format.format(new Date(item.publishedAt))}`,
                item.deadline && `${keyDateLabel(item, n)} ${format.format(new Date(item.deadline))}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )
        }
        title={title}
        titleSize="m"
        breadcrumbLabel={dict.pages.breadcrumb}
        crumbs={[
          { href: `/${locale}`, label: dict.pages.home },
          { href: `/${locale}/news`, label: n.title },
          { href: `/${locale}/news/${item.id}`, label: title },
        ]}
      />
      <div className="container-page py-8">
        <div className="flex max-w-prose flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <KindTag kind={item.kind} labels={n} pinned={item.pinned} />
            {item.ref && (
              <span className="type-caption text-fg-muted tabular">
                {n.ref} {item.ref}
              </span>
            )}
          </div>

          <p className="m-0 type-body-l whitespace-pre-line text-fg-2">{pick(item.body, locale)}</p>

          <dl className="m-0 grid gap-3 tablet:grid-cols-3">
            {item.publishedAt && (
              <Fact icon="calendar" label={n.issued}>
                <time dateTime={item.publishedAt}>{format.format(new Date(item.publishedAt))}</time>
              </Fact>
            )}
            <Fact icon="id" label={n.appliesTo}>
              {pick(item.audience, locale)}
            </Fact>
            {item.deadline && (
              <Fact icon="clock" label={keyDateLabel(item, n)}>
                <time dateTime={item.deadline}>{format.format(new Date(item.deadline))}</time>
              </Fact>
            )}
          </dl>

          {item.action && (
            <Button href={actionHref(item.action.href, locale)} external={item.action.external} variant="secondary" icon="arrow-right" className="self-start">
              {pick(item.action.label, locale)}
            </Button>
          )}

          <p className="m-0 flex items-center gap-2 border-t border-line pt-4 type-caption text-fg-muted">
            <Icon name="shield" size={16} />
            {n.issuer}
          </p>

          <Button href={`/${locale}/news`} variant="link" leadingIcon="arrow-left" className="self-start">
            {dict.pages.allAnnouncements}
          </Button>
        </div>
      </div>
    </article>
  );
}

function Fact({ icon, label, children }: { icon: "calendar" | "id" | "clock"; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 rounded-xs border border-line p-3">
      <dt className="flex items-center gap-1 type-overline text-fg-muted">
        <Icon name={icon} size={16} />
        {label}
      </dt>
      <dd className="m-0 type-label">{children}</dd>
    </div>
  );
}
