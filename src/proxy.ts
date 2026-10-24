import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, locales, type Locale } from "@/lib/i18n/config";

function preferredLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? "";
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return (ranked.find((r) => isLocale(r.lang))?.lang as Locale | undefined) ?? defaultLocale;
}

const publicAdminPaths = new Set(["/admin/login", "/admin/forgot", "/admin/reset"]);

/** Redirect locale-less paths to /pt or /en based on Accept-Language (Portuguese by default). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // Optimistic check only; every admin page and action verifies the signed session.
    if (!publicAdminPaths.has(pathname) && !request.cookies.has("gcr_session")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return;
  }
  if (pathname.startsWith("/uploads/")) return;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;
  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|images|video|fonts|favicon.ico|.*\\..*).*)"],
};
