import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sports } from "@/data/sports";
import { PageHeader } from "@/components/layout/page-header";
import { pageBanners } from "@/data/page-banners";
import { SportCard } from "@/components/sports/sport-card";
import { toSportView } from "@/components/sports/sports-section";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return pageMetadata(locale, "/sports", dict.sports.title, dict.meta.title, dict.sports.intro);
}

export default async function SportsPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const s = dict.sports;
  return (
    <>
      <PageHeader
        id="sports-title"
        overline={s.overline}
        meta={<span className="text-fg-2">{dict.hero.dates}</span>}
        image={pageBanners.sports}
        title={s.title}
        intro={<p className="m-0">{s.intro}</p>}
        breadcrumbLabel={dict.pages.breadcrumb}
        crumbs={[
          { href: `/${locale}`, label: dict.pages.home },
          { href: `/${locale}/sports`, label: s.title },
        ]}
      />
      <div className="container-page py-9">
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 tablet:grid-cols-2 desktop:grid-cols-3 large:grid-cols-4">
          {sports.map((sp, i) => (
            <li key={sp.id}>
              <SportCard
                sport={toSportView(sp, dict, locale)}
                index={i}
                headingLevel="h2"
                labels={{ photo: s.photoRequired }}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
