"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type IconActionProps = {
  /** Spoken by screen readers and shown as the tooltip. */
  label: string;
  /** The lucide icon element, e.g. <Pencil />. */
  icon: ReactNode;
  href?: string;
  destructive?: boolean;
} & Omit<ComponentProps<typeof Button>, "children" | "asChild" | "variant" | "size">;

/**
 * Row action in every Control Room list: an outlined square icon button with a
 * tooltip, so Edit, Delete, Move and account actions share one look. Extra props
 * reach the button, which lets it be the trigger of a ConfirmAction dialog.
 */
export function IconAction({ label, icon, href, destructive, className, ...props }: IconActionProps) {
  const classes = cn(
    "size-10 text-muted-foreground hover:text-foreground md:size-8",
    destructive && "hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive",
    className,
  );
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? (
          <Button asChild variant="outline" size="icon-sm" aria-label={label} className={classes} {...props}>
            <Link href={href}>{icon}</Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" size="icon-sm" aria-label={label} className={classes} {...props}>
            {icon}
          </Button>
        )}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
