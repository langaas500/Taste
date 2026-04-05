import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { getLocale } from "@/lib/i18n";

export async function middleware(request: NextRequest) {
  // Bypass all auth for crawlable endpoints
  if (
    request.nextUrl.pathname === "/robots.txt" ||
    request.nextUrl.pathname === "/manifest.json" ||
    request.nextUrl.pathname === "/manifest.webmanifest" ||
    request.nextUrl.pathname === "/sitemap.xml" ||
    request.nextUrl.pathname === "/sitemap.xsl" ||
    request.nextUrl.pathname === "/api/sitemap" ||
    request.nextUrl.pathname.startsWith("/api/sitemap/") ||
    request.nextUrl.pathname === "/api/backfill-slugs" ||
    request.nextUrl.pathname === "/api/backfill-providers" ||
    request.nextUrl.pathname.startsWith("/api/cron/")
  ) {
    return NextResponse.next();
  }

  // Rewrite /{region}/(movie|tv)/slug → /seo-titles/... to avoid static folder collision
  if (/^\/(?:no|dk|fi|se|en)\/(movie|tv)\/[a-z0-9-]+$/.test(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/seo-titles${request.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Block /dev/* in production
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/dev")) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse(null, { status: 404 });
    }
    return supabaseResponse; // Skip auth locally
  }

  // Protect all routes except login, api/auth, and static files
  const isPublic =
    pathname === "/login" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/contact" ||
    pathname === "/support" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  // SEO guide pages — public, no auth required
  const isSeoPage =
    pathname.startsWith("/no/") ||
    pathname.startsWith("/en/") ||
    pathname.startsWith("/se/") ||
    pathname.startsWith("/dk/") ||
    pathname.startsWith("/fi/");

  // SEO title pages — /no/movie/dune-123, /se/tv/breaking-bad-456 etc.
  const isTitlePage = /^\/(?:no|dk|fi|se)\/(movie|tv)\/[a-z0-9-]+$/.test(pathname);

  // Catch invalid regions that look like title pages (e.g. /us/movie/test) → 404
  if (!isTitlePage && /^\/[a-z]{2}\/(movie|tv)\/[a-z0-9-]+$/.test(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  // Guest-accessible routes (browsing without account)
  const isGuestAllowed =
    pathname === "/" ||
    pathname === "/search" ||
    pathname === "/together" ||
    pathname === "/blinddate" ||
    pathname === "/group" ||
    pathname.startsWith("/group/") ||
    pathname.startsWith("/api/tmdb/") ||
    pathname.startsWith("/api/together/") ||
    pathname.startsWith("/api/group/") ||
    pathname === "/api/stripe/webhook" ||
    pathname.startsWith("/wrapped") ||
    pathname === "/api/wrapped-monthly" ||
    isTitlePage ||
    isSeoPage;

  if (!user && !isPublic && !isGuestAllowed) {
    const url = request.nextUrl.clone();
    const originalPath = request.nextUrl.pathname;
    const originalSearch = request.nextUrl.search;
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("from", originalPath);
    if (originalSearch) {
      const originalParams = new URLSearchParams(originalSearch);
      originalParams.forEach((value, key) => {
        url.searchParams.set(key, value);
      });
    }
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users from /login to /together
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/together";
    return NextResponse.redirect(url);
  }

  // Redirect /home to /together
  if (user && pathname === "/home") {
    const url = request.nextUrl.clone();
    url.pathname = "/together";
    return NextResponse.redirect(url);
  }

  // Set locale cookie — respect user's manual choice, fallback to IP detection
  const existingLocale = request.cookies.get("x-locale")?.value;
  const hasManualChoice = request.cookies.get("x-locale-manual")?.value === "1";
  if (!hasManualChoice) {
    const country = request.headers.get("x-vercel-ip-country") || "";
    const locale = getLocale(country);
    supabaseResponse.cookies.set("x-locale", locale, {
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      maxAge: 86400,
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
