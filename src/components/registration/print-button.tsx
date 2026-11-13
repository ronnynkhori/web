"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="min-h-touch type-label text-link">
      {label}
    </button>
  );
}
