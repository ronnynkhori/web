"use client";

import { Icon } from "@/components/ui/icon";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="hover-overlay press inline-flex min-h-touch items-center gap-2 rounded-xs bg-action-secondary px-4 type-label text-on-action-secondary"
    >
      <Icon name="download" size={16} /> {label}
    </button>
  );
}
