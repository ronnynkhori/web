import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { pageBanners } from "@/data/page-banners";
import { ActivityCalendar, CompetitionGrid, activityEvents } from "@/components/schedule/competition-grid";
import { KeyDates, keyDateEvents } from "@/components/schedule/key-dates";
import { ScheduleDays } from "@/components/schedule/schedule-days";
import { AddToCalendar } from "@/components/ui/add-to-calendar";
import { SubsectionTitle } from "@/components/ui/subsection-title";
import { getSchedule } from "@/lib/cms/read";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pageMetadata } from "@/lib/page-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = await getDictionary(locale);
  return pageMetadata(locale, "/schedule", dict.pages.scheduleTitle, dict.meta.title, dict.pages.scheduleIntro);
}

export default async function SchedulePage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [dict, schedule] = await Promise.all([getDictionary(locale), getSchedule()]);
  const p = dict.pages;
  const g = dict.guide;
  return (
    <>
      <PageHeader
        id="schedule-title"
        overline={g.overline}
        meta={<span className="text-fg-2">{dict.hero.dates}</span>}
        image={pageBanners.schedule}
        title={p.scheduleTitle}
        intro={<p className="m-0">{p.scheduleIntro}</p>}
        breadcrumbLabel={p.breadcrumb}
        crumbs={[
          { href: `/${locale}`, label: p.home },
          { href: `/${locale}/schedule`, label: p.scheduleTitle },
        ]}
      />
      <div className="container-page flex flex-col gap-9 py-9">
        <section aria-labelledby="key-dates-title" className="flex flex-col gap-4">
          <SubsectionTitle id="key-dates-title">{p.keyDates}</SubsectionTitle>
          <KeyDates labels={g} locale={locale} />
          <AddToCalendar fileName="cplp2027-key-dates" label={g.addDates} events={keyDateEvents(g)} className="self-start" />
        </section>

        <section aria-labelledby="glance-title" className="flex flex-col gap-4">
          <SubsectionTitle id="glance-title">{p.glance}</SubsectionTitle>
          <p className="m-0 max-w-prose type-body-m text-fg-2">{p.glanceIntro}</p>
          <CompetitionGrid dict={dict} locale={locale} />
        </section>

        <section aria-labelledby="activities-title" className="flex flex-col gap-4">
          <SubsectionTitle id="activities-title">{p.activities}</SubsectionTitle>
          <ActivityCalendar labels={g.activities} locale={locale} />
          <AddToCalendar fileName="cplp2027-activities" label={p.addActivities} events={activityEvents(g.activities)} className="self-start" />
        </section>

        {schedule.length > 0 && (
          <section aria-labelledby="competition-title" className="flex flex-col gap-4">
            <SubsectionTitle id="competition-title">{p.competition}</SubsectionTitle>
            <ScheduleDays schedule={schedule} locale={locale} addLabel={dict.hub.addToCalendar} addDayLabel={p.addDay} />
          </section>
        )}
      </div>
    </>
  );
}
