import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { pick, type Locale } from "@/lib/i18n/config";
import { getDocuments, getGuide, getSchedule } from "@/lib/cms/read";
import { isPending } from "@/lib/content";
import { KeyDates, keyDateEvents } from "@/components/schedule/key-dates";
import { ScheduleDays } from "@/components/schedule/schedule-days";
import { AddToCalendar } from "@/components/ui/add-to-calendar";
import { Accordion } from "@/components/ui/disclosure";
import { Button } from "@/components/ui/button";
import { RichContent } from "@/components/ui/content-flag";
import { Icon, type IconName } from "@/components/ui/icon";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { MascotCameo } from "@/components/mascot/mascot-cameo";
import { mascotPoses } from "@/data/mascot";

/** Topics already covered by the glance strip stay out of the accordion. */
const glanceIds = new Set(["key-dates", "time-zone"]);

const topicIcon: Record<string, IconName> = {
  travel: "plane",
  accreditation: "id",
  accommodation: "bed",
  safeguarding: "shield",
  broadcast: "tv",
  accessibility: "access",
  emergency: "phone",
  medical: "medical",
  insurance: "shield",
  visas: "globe",
  meals: "meal",
  practical: "info",
  "technical-meetings": "calendar",
  eligibility: "list",
  conduct: "check",
  protocol: "flag",
  "medal-ceremonies": "trophy",
  press: "camera",
};

/** Games guide (#guide): glance strip, practical topics, downloads, help. */
export async function GuideSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const g = dict.guide;
  const [guide, downloads, schedule] = await Promise.all([getGuide(), getDocuments(), getSchedule()]);
  const topics = guide.filter((item) => !glanceIds.has(item.id));
  const files = downloads.filter((d) => d.href);

  return (
    <Section id="guide" labelledBy="guide-title" band="alt">
      <MascotCameo pose={mascotPoses.thumbsUp} className="right-[8%]" />
      <SectionHeader
        id="guide-title"
        overline={g.overline}
        title={g.title}
        intro={g.intro}
        link={{ href: `/${locale}/schedule`, label: dict.pages.fullSchedule }}
      />

      <h3 className="sr-only">{g.glance}</h3>
      <KeyDates labels={g} locale={locale} className="mb-7" />
      <AddToCalendar className="-mt-5 mb-7" fileName="cplp2027-key-dates" label={g.addDates} events={keyDateEvents(g)} />

      {schedule.length > 0 && (
        <div className="mb-7">
          <h3 className="m-0 mb-4 type-overline">{g.schedule}</h3>
          <ScheduleDays schedule={schedule} locale={locale} />
        </div>
      )}

      <div className="grid gap-7 desktop:grid-cols-12 desktop:gap-8">
        <div className="desktop:col-span-7">
          <h3 className="m-0 mb-4 type-overline">{g.topics}</h3>
          <Accordion
            defaultOpenId={topics[0]?.id}
            items={topics.map((item) => ({
              id: item.id,
              title: (
                <span className="flex items-center gap-4">
                  <span className="grid size-touch shrink-0 place-items-center rounded-xs bg-surface-raised text-accent">
                    <Icon name={topicIcon[item.id] ?? "info"} />
                  </span>
                  <span>{pick(item.title, locale)}</span>
                </span>
              ),
              content: (
                <ul className="m-0 flex list-none flex-col gap-2 p-0 pl-8 type-body-m text-fg-2">
                  {pick(item.body, locale).map((line) => (
                    <li key={line}>
                      <RichContent text={line} />
                    </li>
                  ))}
                </ul>
              ),
            }))}
          />
        </div>

        <aside className="flex flex-col gap-4 desktop:col-span-5">
          {files.length > 0 && (
            <div data-theme="dark" className="rounded-sm bg-surface p-5 text-fg tablet:p-6">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h3 className="m-0 type-heading-m">{g.downloads}</h3>
                <span className="type-data-m text-accent tabular">{String(files.length).padStart(2, "0")}</span>
              </div>
              <ul className="m-0 flex list-none flex-col divide-y divide-line p-0">
                {files.map((d) => (
                  <li key={d.id}>
                    <a href={d.href!} download className="group flex min-h-touch-lg items-center gap-4 py-3">
                      <span className="grid size-touch shrink-0 place-items-center rounded-xs bg-surface-raised text-accent">
                        <Icon name="news" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="type-label">{pick(d.title, locale)}</span>
                        <span className="type-caption text-fg-muted">
                          {d.fileType}
                          {!isPending(d.size) && ` · ${d.size}`}
                          {!isPending(d.language) && ` · ${d.language}`}
                          {"version" in d && d.version ? ` · v${d.version}` : ""}
                        </span>
                      </span>
                      <Icon name="download" className="shrink-0 text-accent transition-transform duration-ui group-hover:translate-y-1" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-sm border border-line bg-surface p-5 tablet:p-6">
            <span className="grid size-touch place-items-center rounded-xs bg-action-secondary text-on-action-secondary">
              <Icon name="info" />
            </span>
            <h3 className="m-0 type-heading-m">{g.helpTitle}</h3>
            <p className="m-0 type-body-m text-fg-2">{g.helpBody}</p>
            <Button href={`/${locale}/news`} variant="link" icon="arrow-right" className="self-start">
              {g.helpCta}
            </Button>
          </div>
        </aside>
      </div>
    </Section>
  );
}
