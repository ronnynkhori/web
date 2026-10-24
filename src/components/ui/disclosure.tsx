"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icon";

interface DisclosureProps {
  title: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  headingLevel?: 2 | 3 | 4;
  /** Visual density: "panel" for accordions, "plain" for footer/mobile nav sections. */
  variant?: "panel" | "plain";
  className?: string;
}

/**
 * Primitive 8/8 - open/close region (ARIA disclosure pattern).
 * Height animates via the grid-rows trick (CSS, ui duration); reduced motion
 * makes it instant through the global motion switch.
 */
export function Disclosure({
  title,
  children,
  open: controlled,
  defaultOpen = false,
  onOpenChange,
  headingLevel = 3,
  variant = "panel",
  className,
}: DisclosureProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = controlled ?? uncontrolled;
  const id = useId();
  const Heading = `h${headingLevel}` as const;

  const toggle = () => {
    const next = !open;
    if (controlled === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  };

  return (
    <div className={cn(variant === "panel" && "border-b border-line", className)}>
      <Heading className="m-0">
        <button
          type="button"
          id={`${id}-trigger`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={toggle}
          className={cn(
            "group flex w-full min-h-touch-lg items-center justify-between gap-4 text-left",
            variant === "panel" ? "py-5 type-heading-s" : "py-3 type-label",
          )}
        >
          <span className="u-wipe">{title}</span>
          <Icon
            name="chevron-down"
            className={cn("shrink-0 text-accent transition-transform duration-ui ease-standard", open && "rotate-180")}
          />
        </button>
      </Heading>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        className={cn(
          "grid transition-[grid-template-rows] duration-ui ease-standard",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
        inert={!open}
      >
        <div className="overflow-hidden">
          <div className={cn(variant === "panel" ? "pb-5" : "pb-3")}>{children}</div>
        </div>
      </div>
    </div>
  );
}

interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

/** Accordion = a list of Disclosures. `multiple` allows several open at once. */
export function Accordion({
  items,
  multiple = false,
  defaultOpenId,
  headingLevel = 3,
}: {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpenId?: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(defaultOpenId ? [defaultOpenId] : []));

  const setOpen = (id: string, value: boolean) =>
    setOpenIds((prev) => {
      const next = new Set(multiple ? prev : []);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <Disclosure
          key={item.id}
          title={item.title}
          open={openIds.has(item.id)}
          onOpenChange={(v) => setOpen(item.id, v)}
          headingLevel={headingLevel}
        >
          {item.content}
        </Disclosure>
      ))}
    </div>
  );
}
