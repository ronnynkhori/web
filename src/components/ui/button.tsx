import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon" | "link" | "cta";
export type ButtonSize = "md" | "lg";

const base =
  "group press inline-flex items-center justify-center gap-3 rounded-xs type-label select-none " +
  "disabled:cursor-not-allowed disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:opacity-40";

const variants: Record<ButtonVariant, string> = {
  primary:
    "hover-overlay bg-action-primary text-on-action-primary inset-ring-2 inset-ring-action-primary-edge px-5 min-h-touch-xl tablet:min-h-touch-lg",
  cta: "hover-overlay bg-action-primary text-on-action-primary inset-ring-2 inset-ring-action-primary-edge px-6 min-h-touch-xl tablet:min-h-touch-lg",
  secondary: "hover-overlay bg-action-secondary text-on-action-secondary px-5 min-h-touch-lg",
  ghost: "hover-overlay border-2 border-action-ghost-border text-fg px-5 min-h-touch-lg bg-transparent",
  icon: "hover-overlay border-2 border-action-ghost-border text-fg size-touch-lg shrink-0 bg-transparent",
  link: "text-link normal-case tracking-normal font-semibold min-h-touch underline-offset-4 hover:underline px-0",
};

interface CommonProps {
  variant?: ButtonVariant;
  /** Trailing icon. CTA defaults to an arrow with a 4px nudge on hover. */
  icon?: IconName;
  leadingIcon?: IconName;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; external?: boolean };

function Content({ variant = "primary", icon, leadingIcon, loading, loadingLabel, children }: CommonProps) {
  const trailing = icon ?? (variant === "cta" ? "arrow-right" : undefined);
  return (
    <>
      {leadingIcon && <Icon name={leadingIcon} />}
      {children}
      {loading ? (
        <Spinner label={loadingLabel} />
      ) : (
        trailing && <Icon name={trailing} className={variant === "icon" ? undefined : "nudge"} />
      )}
    </>
  );
}

/**
 * Primitive 2/8 - primary / secondary / ghost / icon / link / CTA.
 * Min height 48px (52px primary on mobile); label type token; 12% hover
 * overlay; press scale 0.98; loading keeps width and announces busy state.
 */
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", icon, leadingIcon, loading, loadingLabel, className, children, ...rest } = props;
  const classes = cn(base, variants[variant], className);
  const content = (
    <Content variant={variant} icon={icon} leadingIcon={leadingIcon} loading={loading} loadingLabel={loadingLabel}>
      {children}
    </Content>
  );

  if (typeof rest.href === "string") {
    const { href, external, ...anchor } = rest as ButtonAsLink;
    if (external || href.startsWith("#") || href.startsWith("http")) {
      return (
        <a
          href={href}
          className={classes}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          {...anchor}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...anchor}>
        {content}
      </Link>
    );
  }

  const { type = "button", disabled, ...button } = rest as ButtonAsButton;
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...button}>
      {content}
    </button>
  );
}
