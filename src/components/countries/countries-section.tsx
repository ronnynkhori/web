import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { pick, type Locale } from "@/lib/i18n/config";
import { getCountries } from "@/lib/cms/read";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { Flag } from "@/components/ui/flag";
import { CountriesGrid } from "./countries-grid";
import { NationsMap } from "./nations-map";

/**
 * Cinematic dark section: "One language. Nine nations." .
 * `compact` (during/after the Games): phones get a flag row instead of the
 * delegation grid, so live content stays close to the top.
 */
export async function CountriesSection({ dict, locale, compact }: { dict: Dictionary; locale: Locale; compact?: boolean }) {
  const c = dict.countries;
  const countries = await getCountries();
  return (
    <Section id="countries" labelledBy="countries-title" theme="dark" swoosh>
      <SectionHeader
        id="countries-title"
        overline={c.overline}
        title={c.title}
        titleAccent={c.titleAccent}
        intro={c.intro}
      />
      <NationsMap
        nations={countries.map((x) => ({ code: x.code, name: pick(x.name, locale), flag: x.flag }))}
        hostLabel={c.mapHost}
        caption={c.mapCaption}
      />
      {compact && (
        <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 tablet:hidden">
          {countries.map((x) => (
            <li key={x.code} className="flex min-w-0 items-center gap-3 rounded-xs border border-line bg-surface-raised p-2">
              <Flag code={x.code} name={pick(x.name, locale)} flag={x.flag} decorative />
              <span className="min-w-0 truncate type-label">{pick(x.name, locale)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className={compact ? "max-tablet:hidden" : undefined}>
        <CountriesGrid
          countries={countries.map((x) => ({
            code: x.code,
            name: pick(x.name, locale),
            flag: x.flag,
            isHost: Boolean(x.isHost),
            membershipConflict: x.membership === "conflict",
            delegationSize: x.delegationSize,
            sportsEntered: x.sportsEntered,
          }))}
          labels={{
            host: c.host,
            selected: c.selected,
            clear: c.clear,
            show: c.show,
            delegationSize: c.delegationSize,
            sportsEntered: c.sportsEntered,
            membershipFlag: c.membershipFlag,
            demo: dict.common.demo,
            demoLong: dict.common.demoLong,
          }}
        />
      </div>
    </Section>
  );
}
