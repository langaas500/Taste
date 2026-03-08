import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";

const ADMIN_EMAILS = ["martinrlangaas@protonmail.com"];

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();

    const admin = createSupabaseAdmin();

    // Resolve email from auth.users
    const { data: authUser } = await admin.auth.admin.getUserById(user.id);
    if (!authUser?.user?.email || !ADMIN_EMAILS.includes(authUser.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sp = req.nextUrl.searchParams;
    const page = Math.max(parseInt(sp.get("page") || "0", 10) || 0, 0);
    const PAGE_SIZE = 50;

    // ── Parallel queries ────────────────────────────
    const [
      slugCountRes,
      curatorCountRes,
      moodCountRes,
      missingCuratorCountRes,
      provNORes,
      provDKRes,
      provFIRes,
      provSERes,
      provDistinctRes,
      seoTitlesRes,
      recentRes,
    ] = await Promise.all([
      // Total with slug
      admin
        .from("titles_cache")
        .select("*", { count: "exact", head: true })
        .not("slug", "is", null),

      // Has curator_hook
      admin
        .from("titles_cache")
        .select("*", { count: "exact", head: true })
        .not("slug", "is", null)
        .not("curator_hook", "is", null),

      // Has mood_tags (non-empty array)
      admin
        .from("titles_cache")
        .select("*", { count: "exact", head: true })
        .not("slug", "is", null)
        .not("mood_tags", "is", null),

      // Missing curator (has slug but no curator_hook)
      admin
        .from("titles_cache")
        .select("*", { count: "exact", head: true })
        .not("slug", "is", null)
        .is("curator_hook", null),

      // Provider counts per country
      admin
        .from("watch_providers_cache")
        .select("*", { count: "exact", head: true })
        .eq("country", "NO"),
      admin
        .from("watch_providers_cache")
        .select("*", { count: "exact", head: true })
        .eq("country", "DK"),
      admin
        .from("watch_providers_cache")
        .select("*", { count: "exact", head: true })
        .eq("country", "FI"),
      admin
        .from("watch_providers_cache")
        .select("*", { count: "exact", head: true })
        .eq("country", "SE"),

      // Distinct titles that have ANY provider data
      admin
        .from("watch_providers_cache")
        .select("tmdb_id", { count: "exact", head: true }),

      // SEO titles paginated
      admin
        .from("titles_cache")
        .select("tmdb_id, type, title, slug, curator_hook, mood_tags, updated_at")
        .not("slug", "is", null)
        .order("updated_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),

      // Recent: last 10 slugs added
      admin
        .from("titles_cache")
        .select("tmdb_id, type, title, slug, updated_at")
        .not("slug", "is", null)
        .order("updated_at", { ascending: false })
        .limit(10),
    ]);

    // For SEO titles — batch check which have providers
    const seoTitles = seoTitlesRes.data || [];
    let providerSet = new Set<string>();
    if (seoTitles.length > 0) {
      const tmdbIds = seoTitles.map((t: { tmdb_id: number }) => t.tmdb_id);
      const { data: provRows } = await admin
        .from("watch_providers_cache")
        .select("tmdb_id, type")
        .in("tmdb_id", tmdbIds);
      if (provRows) {
        for (const r of provRows) {
          providerSet.add(`${r.tmdb_id}:${r.type}`);
        }
      }
    }

    const seoData = seoTitles.map((t: { tmdb_id: number; type: string; title: string; slug: string; curator_hook: string | null; mood_tags: string[] | null; updated_at: string }) => ({
      tmdb_id: t.tmdb_id,
      type: t.type,
      title: t.title,
      slug: t.slug,
      has_providers: providerSet.has(`${t.tmdb_id}:${t.type}`),
      has_curator: !!t.curator_hook,
      has_mood_tags: Array.isArray(t.mood_tags) && t.mood_tags.length > 0,
      updated_at: t.updated_at,
    }));

    // "No providers" = titles with slug minus titles that have provider rows
    const noProvidersCount = Math.max(
      (slugCountRes.count || 0) - (provDistinctRes.count || 0),
      0,
    );

    return NextResponse.json({
      curator: {
        total_with_slug: slugCountRes.count || 0,
        has_curator: curatorCountRes.count || 0,
        has_mood_tags: moodCountRes.count || 0,
        missing_curator: missingCuratorCountRes.count || 0,
      },
      providers: {
        no_providers: noProvidersCount,
        NO: provNORes.count || 0,
        DK: provDKRes.count || 0,
        FI: provFIRes.count || 0,
        SE: provSERes.count || 0,
      },
      seo: {
        page,
        page_size: PAGE_SIZE,
        total: slugCountRes.count || 0,
        titles: seoData,
      },
      recent: (recentRes.data || []).map((t: { tmdb_id: number; type: string; title: string; slug: string; updated_at: string }) => ({
        tmdb_id: t.tmdb_id,
        type: t.type,
        title: t.title,
        slug: t.slug,
        updated_at: t.updated_at,
      })),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    if (msg === "Unauthorized") return NextResponse.json({ error: msg }, { status: 401 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
