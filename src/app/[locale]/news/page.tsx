import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { pageBanners } from "@/data/page-banners";
import { NewsBoard } from "@/components/news/news-section";
import { getAnnouncements } from "@/lib/cms/read";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return pageMetadata(locale, "/news", dict.news.title, dict.meta.title, dict.news.intro);
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [dict, announcements] = await Promise.all([getDictionary(locale), getAnnouncements()]);
  const n = dict.news;
  return (
    <>
      <PageHeader
        id="news-title"
        overline={n.overline}
        image={pageBanners.news}
        title={n.title}
        intro={<p className="m-0">{n.intro}</p>}
        breadcrumbLabel={dict.pages.breadcrumb}
        crumbs={[
          { href: `/${locale}`, label: dict.pages.home },
          { href: `/${locale}/news`, label: n.title },
        ]}
      />
      <div className="container-page py-9">
        {announcements.length > 0 ? (
          <NewsBoard announcements={announcements} labels={n} locale={locale} headingLevel="h2" />
        ) : (
          <EmptyState icon="megaphone" text={dict.common.empty} />
        )}
      </div>
    </>
  );
}
