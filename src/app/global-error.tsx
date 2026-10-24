"use client";

import { errorCopy, localeFromPath } from "@/lib/i18n/error-copy";

/**
 * Last-resort screen when a root layout itself fails. It replaces the whole
 * document, so it carries its own minimal styling (brand green, gold accent).
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const locale = localeFromPath(typeof window === "undefined" ? null : window.location.pathname);
  const t = errorCopy[locale];
  return (
    <html lang={locale}>
      <body style={{ margin: 0, minHeight: "100svh", display: "grid", placeItems: "center", background: "#00261a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <title>{t.errorTitle}</title>
        <main style={{ maxWidth: "36rem", padding: "2rem" }}>
          <p style={{ margin: 0, color: "#c9a85f", fontSize: "3rem", fontWeight: 800 }}>500</p>
          <h1 style={{ margin: "0.5rem 0 1rem", fontSize: "2rem" }}>{t.errorTitle}</h1>
          <p style={{ margin: "0 0 1.5rem", lineHeight: 1.5, opacity: 0.85 }}>{t.errorBody}</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ minHeight: 48, padding: "0 1.25rem", border: 0, borderRadius: 4, background: "#c9a85f", color: "#000", fontWeight: 700, cursor: "pointer" }}
          >
            {t.retry}
          </button>{" "}
          <a href={`/${locale}`} style={{ color: "#c9a85f", marginLeft: "1rem" }}>
            {t.home}
          </a>
        </main>
      </body>
    </html>
  );
}
