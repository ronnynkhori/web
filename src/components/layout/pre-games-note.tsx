import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/** Stands in for live scores and results before competition starts. */
export function PreGamesNote({
  title,
  body,
  cta,
  as: Heading = "h2",
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
  as?: "h2" | "h3";
}) {
  return (
    <div className="flex flex-col gap-4 rounded-sm border border-line bg-surface-raised p-5 tablet:p-6">
      <span className="grid size-touch place-items-center rounded-xs bg-action-secondary text-on-action-secondary">
        <Icon name="clock" />
      </span>
      <Heading className="m-0 type-heading-l">{title}</Heading>
      <p className="m-0 max-w-prose type-body-l text-fg-2">{body}</p>
      {cta && (
        <Button href={cta.href} variant="secondary" icon="arrow-right" className="self-start">
          {cta.label}
        </Button>
      )}
    </div>
  );
}
