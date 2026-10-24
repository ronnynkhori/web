import * as React from "react"
import { cn } from "@/lib/utils"

export type CardTone = "brand" | "live" | "warning" | "info" | "success"

/** Accent bar along the top edge, and the matching tint for icon tiles. */
const toneBar: Record<CardTone, string> = {
  brand: "before:bg-primary",
  live: "before:bg-live",
  warning: "before:bg-highlight",
  info: "before:bg-info-foreground",
  success: "before:bg-success-foreground",
}

export const toneTile: Record<CardTone, string> = {
  brand: "bg-secondary text-primary",
  live: "bg-live/10 text-live",
  warning: "bg-warning text-warning-foreground",
  info: "bg-info text-info-foreground",
  success: "bg-success text-success-foreground",
}

/* Spacing lives in variables so one override (py-0, px-0, gap-0) holds at every breakpoint. */
function Card({ className, tone, ...props }: React.ComponentProps<"div"> & { tone?: CardTone }) {
  return (
    <div
      data-slot="card"
      data-tone={tone}
      className={cn(
        "flex flex-col gap-(--card-gap) rounded-xl border bg-card py-(--card-py) text-card-foreground shadow-xs [--card-gap:--spacing(5)] [--card-px:--spacing(4)] [--card-py:--spacing(5)] md:[--card-gap:--spacing(6)] md:[--card-px:--spacing(6)] md:[--card-py:--spacing(6)]",
        tone && "relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-1 before:content-['']",
        tone && toneBar[tone],
        className
      )}
      {...props}
    />
  )
}

/** Rounded icon square tinted to match a card tone. */
function CardIcon({ tone = "brand", className, ...props }: React.ComponentProps<"span"> & { tone?: CardTone }) {
  return (
    <span
      data-slot="card-icon"
      aria-hidden="true"
      className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg]:size-5", toneTile[tone], className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-(--card-px) has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-(--card-py)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-px)", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-(--card-px) [.border-t]:pt-(--card-py)", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardIcon,
  CardDescription,
  CardContent,
}
