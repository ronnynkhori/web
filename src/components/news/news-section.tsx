import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { pick, type Locale } from "@/lib/i18n/config";
import { getAnnouncements } from "@/lib/cms/read";
import type { Announcement, AnnouncementKind } from "@/data/types";
import { reveal } from "@/lib/animation/reveal";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { MascotCameo } from "@/components/mascot/mascot-cameo";
import { mascotPoses } from "@/data/mascot";

type Labels = Dictionary["news"];

const kindStyle: Record<AnnouncementKind, { icon: IconName; className: string }> = {
  important: { icon: "alert", className: "bg-error text-on-error" },
  deadline: { icon: "clock", className: "bg-warning text-on-warning" },
  update: { icon: "info", className: "border border-fg text-fg" },
  notice: { icon: "megaphone", className: "border border-accent text-accent" },
};

/**
 * Announcements (#news): an official notice board, not editorial news. The pinned
 * notice sits in a dark panel; the rest read as dated, referenced notices with
 * who they apply to, any closing date and a single action.
 */
export async function NewsSection({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const n = dict.news;
  const announcements = await getAnnouncements();
  return (
    <Section id="news" labelledBy="news-title">
      <MascotCameo pose={mascotPoses.football2} className="right-[10%]" />
      <SectionHeader
        id="news-title"
        overline={n.overline}
        title={n.title}
        intro={n.intro}
        link={{ href: `/${locale}/news`, label: dict.pages.allAnnouncements }}
      />
      <NewsBoard announcements={announcements} labels={n} locale={locale} limit={4} />
    </Section>
  );
}

/** Notices link to home sections as "#guide"; resolve them so they work from any page. */
export const actionHref = (href: string, locale: Locale) => (href.startsWith("#") ? `/${locale}${href}` : href);

/** Issued notices newest first; notices without an issue date follow, soonest key date first. */
export const newsFirst = (list: Announcement[]) =>
  [...list].sort((a, b) =>
    a.publishedAt || b.publishedAt
      ? (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")
      : (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"),
  );

export const keyDateLabel = (item: Announcement, labels: Labels) => (item.kind === "deadline" ? labels.closes : labels.date);

export const longDate = (locale: Locale) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Pinned notice beside the dated list; `limit` caps how many notices show in total. */
export function NewsBoard({
  announcements,
  labels: n,
  locale,
  limit,
  headingLevel = "h3",
}: {
  announcements: Announcement[];
  labels: Labels;
  locale: Locale;
  limit?: number;
  headingLevel?: "h2" | "h3";
}) {
  const sorted = newsFirst(announcements);
  const pinned = sorted.find((a) => a.pinned);
  const rest = sorted.filter((a) => a !== pinned).slice(0, limit ? limit - (pinned ? 1 : 0) : undefined);
  const long = longDate(locale);
  const href = (a: Announcement) => `/${locale}/news/${a.id}`;

  return (
      <div className="grid gap-6 desktop:grid-cols-12 desktop:gap-8">
        {pinned && (
          <div className="desktop:col-span-5">
            <PinnedNotice item={pinned} locale={locale} labels={n} format={long} href={href(pinned)} heading={headingLevel} />
          </div>
        )}

        <div className={pinned ? "desktop:col-span-7" : "desktop:col-span-12"}>
          <ol className="m-0 flex list-none flex-col divide-y divide-line border-y border-line p-0">
            {rest.map((item, i) => (
              <li key={item.id} {...reveal("fade-up", i)}>
                <NoticeRow item={item} locale={locale} labels={n} format={long} href={href(item)} heading={headingLevel} />
              </li>
            ))}
          </ol>
          <p className="m-0 mt-4 flex items-center gap-2 type-caption text-fg-muted">
            <Icon name="shield" size={16} />
            {n.issuer}
          </p>
        </div>
      </div>
  );
}

export function KindTag({ kind, labels, pinned }: { kind: AnnouncementKind; labels: Labels; pinned?: boolean }) {
  const style = kindStyle[kind];
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {pinned && (
        <span className="inline-flex items-center gap-1 rounded-xs border border-line-strong px-2 py-1 type-label font-bold">
          <Icon name="pin" size={16} />
          {labels.pinned}
        </span>
      )}
      <span className={cn("inline-flex items-center gap-1 rounded-xs px-2 py-1 type-label font-bold", style.className)}>
        <Icon name={style.icon} size={16} />
        {labels.kinds[kind]}
      </span>
    </span>
  );
}

function NoticeTitle({ item, locale, href, heading: Heading, className }: { item: Announcement; locale: Locale; href?: string; heading: "h2" | "h3"; className: string }) {
  const title = pick(item.title, locale);
  return (
    <Heading id={`${item.id}-title`} className={className}>
      {href ? (
        <Link href={href} className="underline-offset-4 hover:underline">
          {title}
        </Link>
      ) : (
        title
      )}
    </Heading>
  );
}

interface NoticeProps {
  item: Announcement;
  locale: Locale;
  labels: Labels;
  format: Intl.DateTimeFormat;
  href?: string;
  heading?: "h2" | "h3";
}

function PinnedNotice({ item, locale, labels, format, href, heading = "h3" }: NoticeProps) {
  return (
    <article
      data-theme="dark"
      data-surface="black"
      aria-labelledby={`${item.id}-title`}
      className="relative flex flex-col gap-5 desktop:sticky desktop:top-9 overflow-hidden rounded-sm bg-surface p-5 text-fg tablet:p-6"
      {...reveal("fade-up", 0)}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-line-accent" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-5 -bottom-5 text-fg opacity-[0.06] [&>svg]:size-[10rem]">
        <Icon name="megaphone" size={32} />
      </span>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <KindTag kind={item.kind} labels={labels} pinned />
        {item.ref && (
          <span className="type-caption text-fg-muted tabular">
            {labels.ref} {item.ref}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <NoticeTitle item={item} locale={locale} href={href} heading={heading} className="m-0 type-heading-l" />
        <p className="m-0 type-body-l text-fg-2">{pick(item.body, locale)}</p>
      </div>

      <dl className="m-0 grid grid-cols-2 gap-3">
        {item.deadline && (
          <div className="flex flex-col gap-1 rounded-xs border border-line p-3">
            <dt className="flex items-center gap-1 type-overline text-accent">
              <Icon name="clock" size={16} />
              {keyDateLabel(item, labels)}
            </dt>
            <dd className="m-0 type-label">
              <time dateTime={item.deadline}>{format.format(new Date(item.deadline))}</time>
            </dd>
          </div>
        )}
        <div className="flex flex-col gap-1 rounded-xs border border-line p-3">
          <dt className="flex items-center gap-1 type-overline text-fg-muted">
            <Icon name="id" size={16} />
            {labels.appliesTo}
          </dt>
          <dd className="m-0 type-label">{pick(item.audience, locale)}</dd>
        </div>
      </dl>

      {(item.publishedAt || item.action) && (
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          {item.publishedAt && (
            <span className="type-caption text-fg-muted">
              {labels.issued} <time dateTime={item.publishedAt}>{format.format(new Date(item.publishedAt))}</time>
            </span>
          )}
          {item.action && (
            <Button href={actionHref(item.action.href, locale)} external={item.action.external} variant="secondary" icon="arrow-right">
              {pick(item.action.label, locale)}
            </Button>
          )}
        </div>
      )}
    </article>
  );
}

/** Calendar tile: the issue date, else the key date, else the notice type's icon. */
function DateTile({ item, locale, labels, format }: Pick<NoticeProps, "item" | "locale" | "labels" | "format">) {
  const iso = item.publishedAt ?? item.deadline;
  const tile = "flex flex-col items-center self-start rounded-xs border border-line py-2";
  if (!iso) {
    return (
      <span aria-hidden="true" className={cn(tile, "text-fg-muted")}>
        <Icon name={kindStyle[item.kind].icon} size={24} />
      </span>
    );
  }
  const date = new Date(iso);
  const month = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(date);
  const label = item.publishedAt ? labels.issued : keyDateLabel(item, labels);
  return (
    <time dateTime={iso} title={`${label} ${format.format(date)}`} className={tile}>
      <span className="type-heading-l tabular leading-none">{iso.slice(8, 10)}</span>
      <span className="type-overline text-fg-muted">{month.replace(".", "")}</span>
    </time>
  );
}

function NoticeRow({ item, locale, labels, format, href, heading = "h3" }: NoticeProps) {
  return (
    <article aria-labelledby={`${item.id}-title`} className="grid grid-cols-[3.5rem_1fr] gap-4 py-5 tablet:grid-cols-[4.5rem_1fr] tablet:gap-5">
      <DateTile item={item} locale={locale} labels={labels} format={format} />

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <KindTag kind={item.kind} labels={labels} />
          {item.ref && (
            <span className="type-caption text-fg-muted tabular">
              {labels.ref} {item.ref}
            </span>
          )}
        </div>
        <NoticeTitle item={item} locale={locale} href={href} heading={heading} className="m-0 type-heading-s" />
        <p className="m-0 type-body-m text-fg-2">{pick(item.body, locale)}</p>
        <dl className="m-0 flex flex-wrap gap-x-5 gap-y-1 type-caption">
          <div className="flex items-center gap-1">
            <dt className="flex items-center gap-1 text-fg-muted">
              <Icon name="id" size={16} />
              {labels.appliesTo}:
            </dt>
            <dd className="m-0 font-semibold">{pick(item.audience, locale)}</dd>
          </div>
          {item.deadline && (
            <div className="flex items-center gap-1">
              <dt className="flex items-center gap-1 text-fg-muted">
                <Icon name="clock" size={16} />
                {keyDateLabel(item, labels)}:
              </dt>
              <dd className="m-0 font-semibold">
                <time dateTime={item.deadline}>{format.format(new Date(item.deadline))}</time>
              </dd>
            </div>
          )}
        </dl>
        {item.action && (
          <Button href={actionHref(item.action.href, locale)} external={item.action.external} variant="link" icon="arrow-right" className="self-start">
            {pick(item.action.label, locale)}
          </Button>
        )}
      </div>
    </article>
  );
}
