import type { Instrumentation } from "next";

/**
 * Server error reporting. Every captured error is written as one JSON line,
 * which Vercel's runtime logs index and can alert on. Set ERROR_WEBHOOK_URL
 * (Slack / Teams / any endpoint) to also be notified during the Games.
 * Request headers are deliberately not logged: they carry the admin session cookie.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  const entry = {
    level: "error",
    at: new Date().toISOString(),
    message: err instanceof Error ? err.message : String(err),
    digest: typeof err === "object" && err !== null && "digest" in err ? String(err.digest) : undefined,
    method: request.method,
    path: request.path,
    route: context.routePath,
    routeType: context.routeType,
    renderSource: "renderSource" in context ? context.renderSource : undefined,
  };
  console.error(JSON.stringify(entry));

  const hook = process.env.ERROR_WEBHOOK_URL;
  if (!hook) return;
  try {
    await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `CPLP 2027 site error on ${entry.method} ${entry.path}: ${entry.message}`, ...entry }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Reporting must never break the request that failed.
  }
};
