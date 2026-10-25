import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { fill, pick, type Locale } from "@/lib/i18n/config";
import { mascotPoses, sportPoses } from "@/data/mascot";
import { reveal } from "@/lib/animation/reveal";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { SwooshEdge } from "@/components/ui/swoosh-edge";
import { MascotStage, type MascotPoseView } from "./mascot-stage";

/** The official mascot, the galinha-capota: its role on a navy band, with every sport pose. */
export function MascotSection({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const m = dict.mascot;
  const poses: MascotPoseView[] = [mascotPoses.welcome, ...sportPoses].map(
    (p) => {
      const label = pick(p.label, locale);
      return {
        id: p.id,
        src: p.src,
        width: p.width,
        height: p.height,
        label,
        alt: fill(m.poseAlt, { sport: label }),
      };
    },
  );
  return (
    <div data-theme="dark" className="relative">
      <SwooshEdge side="top" />
      <section
        id="mascot"
        aria-labelledby="mascot-title"
        data-theme="dark"
        className="section-anchor sona-bg relative isolate overflow-hidden bg-surface text-fg"
      >
        <span
          aria-hidden="true"
          className="mascot-swoosh absolute inset-0 -z-10"
        />
        <div className="container-page section-y grid items-center gap-8 desktop:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] desktop:gap-9">
          <div>
            <SectionHeader
              id="mascot-title"
              overline={m.overline}
              title={m.title}
              titleAccent={m.titleAccent}
              intro={m.intro}
              className="mb-6! desktop:mb-7!"
            />
            <ul className="m-0 grid list-none gap-x-6 gap-y-4 p-0 tablet:grid-cols-2">
              {m.traits.map((trait, i) => (
                <li
                  key={trait.title}
                  className="border-l-4 border-line-accent pl-4"
                  {...reveal("fade-up", i + 2)}
                >
                  <p className="m-0 type-heading-s">{trait.title}</p>
                  <p className="m-0 mt-1 type-body-s text-fg-2">{trait.body}</p>
                </li>
              ))}
            </ul>
            <p className="m-0 mt-7 max-w-[30ch] font-display text-[clamp(1.25rem,1rem+1vw,1.75rem)] leading-tight font-extrabold text-accent uppercase" {...reveal("fade-up", 6)}>
              {m.motto}
            </p>
            <Button
              href={`/${locale}#sports`}
              variant="secondary"
              icon="arrow-right"
              className="mt-7"
            >
              {m.cta}
            </Button>
          </div>
          <MascotStage poses={poses} label={m.posesLabel} />
        </div>
      </section>
      <SwooshEdge side="bottom" flip />
    </div>
  );
}
