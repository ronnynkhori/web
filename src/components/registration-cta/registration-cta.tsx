import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { SectionHeader } from "@/components/ui/section-header";
import { countries } from "@/data/countries";
import { mascotPoses } from "@/data/mascot";
import { reveal } from "@/lib/animation/reveal";
import { pick, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/** Home-page invitation for delegation officers: what the portal does and the way in. Shown before the Games. */
export function RegistrationCta({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const r = dict.registrationCta;
  const mascot = mascotPoses.thumbsUp;
  return (
    <section id="registration" aria-labelledby="registration-title" className="section-anchor relative bg-surface-2 text-fg">
      <div className="container-page section-y">
        <div className="grid overflow-hidden rounded-md border border-line bg-surface-raised desktop:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6 p-6 desktop:p-7">
            <SectionHeader id="registration-title" overline={r.overline} title={r.title} titleAccent={r.titleAccent} intro={r.body} className="mb-0! desktop:mb-0!" />
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {r.points.map((point, index) => (
                <li key={point} className="flex items-start gap-3 type-body-m" {...reveal("fade-up", index)}>
                  <span aria-hidden="true" className="grid size-[1.75rem] shrink-0 place-items-center rounded-pill bg-action-secondary text-on-action-secondary">
                    <Icon name="check" size={16} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              <a
                href={`/${locale}/delegation/login`}
                className="hover-overlay press group inline-flex min-h-touch-xl items-center justify-center gap-3 self-start rounded-xs bg-action-primary px-6 type-label text-on-action-primary inset-ring-2 inset-ring-action-primary-edge tablet:min-h-touch-lg"
              >
                {r.cta} <Icon name="arrow-right" className="nudge" />
              </a>
              <p className="m-0 flex items-center gap-2 type-caption text-fg-muted">
                <Icon name="shield" size={16} /> {r.note}
              </p>
            </div>
          </div>
          <div data-theme="dark" className="brand-pattern pattern-lusona pattern-corner relative isolate flex min-h-[20rem] items-end justify-center overflow-hidden bg-surface px-6 pt-6">
            <div aria-hidden="true" className="torch-stripe absolute inset-x-0 top-0 h-1.5 desktop:hidden" />
            <div aria-hidden="true" className="torch-stripe-vertical absolute inset-y-0 left-0 hidden w-1.5 desktop:block" />
            <ul aria-hidden="true" className="absolute inset-x-6 top-6 m-0 flex list-none flex-wrap justify-center gap-2 p-0">
              {countries.map((country) =>
                country.flag ? (
                  <li key={country.code}>
                    <Image src={country.flag.src} alt="" width={48} height={32} className="h-[1.5rem] w-[2.25rem] rounded-xs object-cover ring-1 ring-line" title={pick(country.name, locale)} />
                  </li>
                ) : null,
              )}
            </ul>
            <Image src={mascot.src} alt="" width={mascot.width} height={mascot.height} sizes="(min-width: 64rem) 22rem, 16rem" className="relative mt-16 h-auto w-64 drop-shadow-[0_8px_16px_rgb(0_0_0/0.18)] desktop:w-[22rem]" {...reveal("fade-up", 1)} />
          </div>
        </div>
      </div>
    </section>
  );
}
