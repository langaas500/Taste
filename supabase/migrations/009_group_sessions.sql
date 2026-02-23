-- Migration 009: Group Sessions for Se Sammen
-- 3+ deltakere swiper på delt pool, stemmer på finalister, velger vinner.
-- Votes og final_votes lagres som JSONB i group_sessions (ingen separate tabeller).
-- All access via createSupabaseAdmin() (bypasser RLS).

-- ── 1. group_sessions ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.group_sessions (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  code                  TEXT         UNIQUE NOT NULL,
  host_user_id          TEXT         NOT NULL,
  status                TEXT         NOT NULL DEFAULT 'lobby'
                                     CHECK (status IN ('lobby', 'pool_ready', 'swiping', 'final_voting', 'completed')),
  media_filter          TEXT         NOT NULL DEFAULT 'both'
                                     CHECK (media_filter IN ('movie', 'tv', 'both')),
  provider_region       TEXT         NOT NULL DEFAULT 'US',
  min_participants      INT          NOT NULL DEFAULT 2,
  pool                  JSONB        NOT NULL DEFAULT '[]'::jsonb,
  votes                 JSONB        NOT NULL DEFAULT '{}'::jsonb,
  final_votes           JSONB        NOT NULL DEFAULT '{}'::jsonb,
  finalist_tmdb_ids     INT[]        DEFAULT '{}',
  final_pick_tmdb_id    INT,
  final_pick_media_type TEXT         CHECK (final_pick_media_type IS NULL OR final_pick_media_type IN ('movie', 'tv')),
  created_at            TIMESTAMPTZ  DEFAULT now(),
  updated_at            TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_sessions_code
  ON public.group_sessions (code);

CREATE INDEX IF NOT EXISTS idx_group_sessions_status
  ON public.group_sessions (status)
  WHERE status IN ('lobby', 'swiping', 'final_voting');

ALTER TABLE public.group_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'group_sessions_allow_all' AND tablename = 'group_sessions'
  ) THEN
    CREATE POLICY "group_sessions_allow_all"
      ON public.group_sessions FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 2. group_session_participants ───────────────────────────────────

CREATE TABLE IF NOT EXISTS public.group_session_participants (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID         NOT NULL REFERENCES public.group_sessions(id) ON DELETE CASCADE,
  user_id       TEXT         NOT NULL,
  display_name  TEXT,
  provider_ids  INT[]        DEFAULT '{}',
  joined_at     TIMESTAMPTZ  DEFAULT now(),
  CONSTRAINT group_participants_unique UNIQUE (session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_participants_session
  ON public.group_session_participants (session_id);

ALTER TABLE public.group_session_participants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'group_participants_allow_all' AND tablename = 'group_session_participants'
  ) THEN
    CREATE POLICY "group_participants_allow_all"
      ON public.group_session_participants FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ── 3. RPC: group_apply_vote (atomic JSONB upsert) ─────────────────
-- votes JSONB structure: { "user_id": { "tmdb_id:media_type": "liked"|"neutral"|"disliked" } }

CREATE OR REPLACE FUNCTION public.group_apply_vote(
  p_session_id UUID,
  p_user_id    TEXT,
  p_key        TEXT,
  p_vote       TEXT
) RETURNS void AS $$
BEGIN
  UPDATE public.group_sessions
  SET
    votes = jsonb_set(
      CASE
        WHEN votes ? p_user_id THEN votes
        ELSE jsonb_set(votes, ARRAY[p_user_id], '{}'::jsonb)
      END,
      ARRAY[p_user_id, p_key],
      to_jsonb(p_vote)
    ),
    updated_at = now()
  WHERE id = p_session_id AND status = 'swiping';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 4. RPC: group_claim_pool_build (atomic CAS: lobby → pool_ready) ─

CREATE OR REPLACE FUNCTION public.group_claim_pool_build(
  p_session_id UUID
) RETURNS SETOF public.group_sessions AS $$
BEGIN
  RETURN QUERY
  UPDATE public.group_sessions
  SET status = 'pool_ready', updated_at = now()
  WHERE id = p_session_id AND status = 'lobby'
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
