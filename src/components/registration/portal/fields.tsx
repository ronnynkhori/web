import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const inputClass =
  "min-h-touch w-full rounded-sm border border-line-strong bg-surface px-3 type-body-m text-fg shadow-sm outline-none transition-colors duration-ui " +
  "placeholder:text-fg-muted hover:border-fg-muted focus-visible:border-focus focus-visible:shadow-focus disabled:opacity-60";

/** Label above, optional hint below, "Required" or "Optional" marker on the right. */
export function Field({ label, hint, required, mark, children, className, wide }: { label: string; hint?: ReactNode; required?: boolean; mark?: { required: string; optional: string }; children: ReactNode; className?: string; wide?: boolean }) {
  return (
    <label className={cn("flex flex-col gap-1.5", wide && "tablet:col-span-2", className)}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="type-body-s font-semibold text-fg">
          {label}
          {required && <span aria-hidden="true" className="ml-0.5 text-accent">*</span>}
        </span>
        {mark && <span className="type-caption text-fg-muted">{required ? mark.required : mark.optional}</span>}
      </span>
      {children}
      {hint && <span className="type-caption text-fg-muted">{hint}</span>}
    </label>
  );
}

/** A numbered form block: title and help on the left (desktop), fields on the right. */
export function FormSection({ n, title, help, children, tone, id }: { n: number; title: string; help?: ReactNode; children: ReactNode; tone?: "attention"; id?: string }) {
  return (
    <section id={id} className={cn("grid gap-5 rounded-md border bg-surface-raised p-5 shadow-sm tablet:p-6 desktop:grid-cols-[15rem_1fr] desktop:gap-7", tone === "attention" ? "border-line-accent" : "border-line")}>
      <header className="flex flex-col gap-2">
        <span aria-hidden="true" className="grid size-[2.25rem] place-items-center rounded-pill bg-surface-inverse font-display text-lg text-fg-on-inverse">{n}</span>
        <h2 className="m-0 type-heading-s">{title}</h2>
        {help && <p className="m-0 type-body-s text-fg-muted">{help}</p>}
      </header>
      <div className="grid content-start gap-5 tablet:grid-cols-2">{children}</div>
    </section>
  );
}

export function ErrorList({ title, errors }: { title: string; errors: string[] }) {
  if (!errors.length) return null;
  return (
    <div role="alert" className="rounded-md border border-line-accent bg-error/10 p-4 tablet:p-5">
      <p className="m-0 mb-2 type-body-s font-bold text-fg">{title}</p>
      <ul className="m-0 flex list-disc flex-col gap-1 pl-5 type-body-s text-fg">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
