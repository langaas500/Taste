import { NextRequest, NextResponse } from "next/server";
import { getWtUserId } from "@/lib/auth";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { tmdbDiscover, parseTitleFromTMDB } from "@/lib/tmdb";
import type { GroupPoolItem } from "@/types/group";

const POOL_TARGET = 24;
const POOL_MIN = 3;
const POOL_MAX = 27;
const MIN_YEAR = 1995;
const QUALITY_RATING = 6.5;
const BLOCKED_LANGS = new Set(["hi", "ta", "te", "ml", "kn", "pa", "bn", "mr", "ja"]);
const BLOCKED_GENRES = new Set([16]); // Animation

/** Simple concurrency limiter — no external deps. */
async function withConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  if (items.length === 0) return;
  const iter = items[Symbol.iterator]();
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    for (let next = iter.next(); !next.done; next = iter.next()) {
      await fn(next.value);
    }
  });
  await Promise.all(workers);
}

// POST: Host triggers pool build
export async function POST(req: NextRequest) {
  try {
    const userId = await getWtUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { session_id } = await req.json();
    if (!session_id) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

    const admin = createSupabaseAdmin();

    // 1. Atomic CAS: lobby → pool_ready
    const { data: claimed, error: rpcError } = await admin.rpc("group_claim_pool_build", {
      p_session_id: session_id,
    });

    if (rpcError || !claimed || claimed.length === 0) {
      return NextResponse.json({ error: "Session not in lobby state" }, { status: 400 });
    }

    const session = claimed[0];

    // Verify caller is the host
    if (session.host_user_id !== userId) {
      // Rollback
      await admin.from("group_sessions").update({ status: "lobby" }).eq("id", session_id);
      return NextResponse.json({ error: "Only the host can build the pool" }, { status: 403 });
    }

    // Helper: rollback to lobby on any failure
    async function rollbackToLobby() {
      await admin.from("group_sessions").update({ status: "lobby", updated_at: new Date().toISOString() }).eq("id", session_id);
    }

    try {
      // 2. Get all participants' provider_ids
      const { data: participants } = await admin
        .from("group_session_participants")
        .select("provider_ids")
        .eq("session_id", session_id);

      // 3. Majority rule: include provider if >= 50% of participants have it
      const providerCount: Record<number, number> = {};
      const totalParticipants = (participants || []).length;
      for (const p of participants || []) {
        for (const pid of p.provider_ids || []) {
          providerCount[pid] = (providerCount[pid] || 0) + 1;
        }
      }
      const threshold = Math.ceil(totalParticipants / 2);
      const groupProviderIds = Object.entries(providerCount)
        .filter(([, count]) => count >= threshold)
        .map(([id]) => Number(id));

      // 4. Fetch from TMDB discover
      const mediaFilter = session.media_filter as string;
      const region = session.provider_region || "US";
      const providerParams: Record<string, string> =
        groupProviderIds.length > 0
          ? { with_watch_providers: groupProviderIds.join("|"), watch_region: region }
          : {};

      const pool: GroupPoolItem[] = [];
      const seen = new Set<string>();

      const typesToFetch: ("movie" | "tv")[] =
        mediaFilter === "both" ? ["movie", "tv"] :
        mediaFilter === "movie" ? ["movie"] : ["tv"];

      // Fetch up to 3 pages per type with concurrency 4
      const fetchTasks = typesToFetch.flatMap((type) =>
        [1, 2, 3].map((page) => ({ type, page }))
      );

      await withConcurrency(fetchTasks, 4, async ({ type, page }) => {
        try {
          const data = await tmdbDiscover(type, {
            sort_by: "popularity.desc",
            "vote_average.gte": String(QUALITY_RATING),
            "vote_count.gte": type === "movie" ? "150" : "100",
            ...(type === "movie"
              ? { "primary_release_date.gte": `${MIN_YEAR}-01-01` }
              : { "first_air_date.gte": `${MIN_YEAR}-01-01` }),
            page: String(page),
            ...providerParams,
          });
          for (const item of data.results || []) {
            const lang = (item.original_language as string) || "";
            if (BLOCKED_LANGS.has(lang)) continue;
            if (item.adult === true) continue;

            const parsed = parseTitleFromTMDB(item, type);
            if (!parsed.poster_path) continue;

            const key = `${parsed.tmdb_id}:${parsed.type}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const genreIds = Array.isArray(parsed.genres)
              ? (parsed.genres as (number | { id: number })[])
                  .map((g) => (typeof g === "number" ? g : g.id))
                  .filter(Boolean)
              : [];
            if (genreIds.some((g) => BLOCKED_GENRES.has(g))) continue;

            pool.push({
              tmdb_id: parsed.tmdb_id,
              media_type: parsed.type,
              title: parsed.title,
              poster_path: parsed.poster_path,
              overview: parsed.overview || "",
              vote_average: parsed.vote_average,
              year: parsed.year,
              genre_ids: genreIds,
            });
          }
        } catch {
          // Skip failed page
        }
      });

      // 5. Check minimum pool size
      if (pool.length < POOL_MIN) {
        await rollbackToLobby();
        return NextResponse.json(
          { error: "Kunne ikke bygge innholdsliste. For få resultater — prøv andre filtre." },
          { status: 422 }
        );
      }

      // 6. Shuffle and clamp pool
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const finalPool = pool.slice(0, Math.min(pool.length, POOL_MAX));

      // 7. Store pool and advance to 'swiping'
      await admin
        .from("group_sessions")
        .update({
          pool: finalPool,
          status: "swiping",
          updated_at: new Date().toISOString(),
        })
        .eq("id", session_id);

      return NextResponse.json({ ok: true, pool_size: finalPool.length });
    } catch (buildError: unknown) {
      // TMDB or any other failure — rollback to lobby so host can retry
      await rollbackToLobby();
      const msg = buildError instanceof Error ? buildError.message : "Pool build failed";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
