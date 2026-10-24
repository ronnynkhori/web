import type { ReactNode } from "react";
import { TorchStripe } from "@/components/ui/torch-stripe";

/** Shared layout for the 404 and error screens: dark brand panel, one message, clear ways out. */
export function StatusScreen({ code, title, body, children }: { code: string; title: string; body: string; children: ReactNode }) {
  return (
    <section
      data-theme="dark"
      aria-labelledby="status-title"
      className="relative isolate flex min-h-[80svh] items-center overflow-hidden bg-surface text-fg"
    >
      <TorchStripe variant="edge" className="right-0 -z-10" />
      <div className="container-wide flex flex-col gap-5 pt-[calc(var(--header-h)+var(--tk-space-6))] pb-9">
        <p className="m-0 type-display-l text-accent tabular" aria-hidden="true">
          {code}
        </p>
        <h1 id="status-title" className="m-0 type-display-m">
          {title}
        </h1>
        <p className="m-0 max-w-prose type-body-l text-fg-2">{body}</p>
        <div className="mt-3 flex flex-wrap gap-3">{children}</div>
      </div>
    </section>
  );
}
