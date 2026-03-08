import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

export async function middleware(request: NextRequest) {
  // Bypass all auth for crawlable endpoints
  if (
    request.nextUrl.pathname === "/robots.txt" ||
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

  // Rewrite /no/(movie|tv)/slug → /_titles/no/... to avoid static /no/ folder collision
  if (/^\/no\/(movie|tv)\/[a-z0-9-]+$/.test(request.nextUrl.pathname)) {
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
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  // SEO guide pages — public, no auth required
  const isSeoPage =
    pathname.startsWith("/no/") ||
    pathname.startsWith("/en/");

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
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users from /login to /home
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
