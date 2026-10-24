import type { ReactNode } from "react";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { Disclosure } from "@/components/ui/disclosure";
import { Logo } from "@/components/ui/logo";
import { TorchStripe } from "@/components/ui/torch-stripe";
import { MascotActor } from "@/components/mascot/mascot-actor";
import { mascotPoses } from "@/data/mascot";
import { LanguageSwitch } from "./language-switch";
import { MotionToggle } from "./motion-toggle";
import type { NavItem } from "./nav-items";

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
  items: NavItem[];
}

function LinkList({ links }: { links: Array<{ href: string; label: string }> }) {
  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {links.map((l) => (
        <li key={l.label}>
          <a href={l.href} className="u-wipe inline-flex min-h-touch items-center type-body-s text-fg-2 hover:text-fg">
            {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Column that is a plain list from tablet up and a Disclosure on mobile. */
function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <div className="hidden tablet:block">
        <h2 className="m-0 mb-3 type-label text-accent">{title}</h2>
        {children}
      </div>
      <Disclosure title={title} variant="plain" headingLevel={2} className="border-b border-line tablet:hidden">
        {children}
      </Disclosure>
    </>
  );
}

/**
 * D: 3 columns (identity, explore, info) + legal bar.
 * T: 2 columns. M: stacked Disclosure sections.
 * Legal pages live at /{locale}/privacy, cookies, terms, accessibility and contact.
 */
export function Footer({ locale, dict, items }: FooterProps) {
  const f = dict.footer;
  return (
    <footer data-theme="dark" className="relative border-t border-line bg-surface text-fg">
      <TorchStripe />
      <div aria-hidden="true" data-mascot-track="" suppressHydrationWarning className="container-wide flex items-end gap-4 overflow-hidden pt-8 tablet:gap-6 desktop:pt-9">
        <MascotActor
          {...mascotPoses.welcome}
          sizes="(min-width: 64rem) 10rem, 6rem"
          depth={0.6}
          className="h-[clamp(6rem,4rem+8vw,11rem)] shrink-0"
          imgClassName="h-full w-auto"
        />
        <div className="min-w-0 pb-2">
          <p className="m-0 mb-2 type-overline text-accent">{f.farewell}</p>
          <p className="footer-outline m-0 font-display text-[clamp(2.75rem,1rem+8.5vw,9.5rem)] font-extrabold whitespace-nowrap uppercase">
            Angola <span>2027</span>
          </p>
        </div>
      </div>
      <div className="container-wide grid gap-6 py-8 tablet:grid-cols-2 tablet:gap-7 desktop:grid-cols-[2fr_1fr_1fr] desktop:py-9">
        <div className="flex flex-col gap-4">
          {/* The logo's red flame vanishes on the red footer, so it sits on a white tile. */}
          <div data-theme="light" className="self-start rounded-sm bg-surface p-3">
            <Logo label={dict.a11y.logo} size="footer" />
          </div>
          <p className="m-0 max-w-prose type-body-s text-fg-2">{f.identity}</p>
          <LanguageSwitch locale={locale} label={dict.a11y.language} switchToTemplate={dict.a11y.switchTo} placement="up" className="self-start" />
          <MotionToggle label={f.reduceMotion} className="self-start" />
        </div>

        <FooterColumn title={f.explore}>
          <nav aria-label={dict.a11y.footerNav}>
            <LinkList links={items.map((i) => ({ href: i.href, label: i.label }))} />
          </nav>
        </FooterColumn>

        <FooterColumn title={f.info}>
          <LinkList
            links={[
              { href: `/${locale}#guide`, label: dict.nav.guide },
              { href: `/${locale}/schedule`, label: dict.pages.scheduleTitle },
              { href: `/${locale}/results`, label: dict.pages.resultsTitle },
              { href: `/${locale}/news`, label: dict.pages.allAnnouncements },
              { href: `/${locale}/accessibility`, label: f.accessibility },
              { href: `/${locale}/contact`, label: f.contact },
              { href: `/${locale}/contact`, label: dict.sponsors.cta },
            ]}
          />
        </FooterColumn>
      </div>

      <div className="border-t border-line">
        <div className="container-wide flex flex-col gap-2 py-5 type-caption text-fg-muted tablet:flex-row tablet:items-center tablet:justify-between">
          <p className="m-0">{f.copyright}</p>
          <ul className="m-0 flex list-none gap-5 p-0">
            {[
              { slug: "privacy", label: f.privacy },
              { slug: "cookies", label: f.cookies },
              { slug: "terms", label: f.terms },
            ].map((l) => (
              <li key={l.slug}>
                <a href={`/${locale}/${l.slug}`} className="u-wipe inline-flex min-h-touch items-center hover:text-fg">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
