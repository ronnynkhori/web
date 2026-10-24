/** Search engines need absolute URLs; NEXT_PUBLIC_SITE_URL wins once a custom domain is live. */
export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

/**
 * The site stays out of search engines until SITE_PUBLIC=1 is set on the
 * production deployment at launch. Preview deployments are never indexed.
 */
export function sitePublic(): boolean {
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") return false;
  return process.env.SITE_PUBLIC === "1";
}
