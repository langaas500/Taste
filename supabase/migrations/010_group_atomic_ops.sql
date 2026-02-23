-- Migration 010: Atomic operations for group sessions
-- Fixes race conditions in final-vote, compute-finalists, and finalize.

-- ── 1. Atomic final vote (replaces read-modify-write) ────────────────
-- Sets final_votes[p_user_id] = p_tmdb_id atomically.
-- Only works when status = 'final_voting' and tmdb_id is in finalist_tmdb_ids.
-- Returns true if the vote was applied, false otherwise.

CREATE OR REPLACE FUNCTION public.group_apply_final_vote(
  p_session_id UUID,
  p_user_id    TEXT,
  p_tmdb_id    INT
) RETURNS BOOLEAN AS $$
DECLARE
  rows_affected INT;
BEGIN
  UPDATE public.group_sessions
  SET
    final_votes = jsonb_set(
      final_votes,
      ARRAY[p_user_id],
      to_jsonb(p_tmdb_id::TEXT),
      true
    ),
    updated_at = now()
  WHERE id = p_session_id
    AND status = 'final_voting'
    AND p_tmdb_id = ANY(finalist_tmdb_ids);

  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 2. Atomic CAS: swiping → final_voting (for compute-finalists) ────
-- Sets status, finalist_tmdb_ids, and final_votes in one atomic op.
-- Returns the updated row if CAS succeeded, empty set otherwise.

CREATE OR REPLACE FUNCTION public.group_set_finalists(
  p_session_id      UUID,
  p_finalist_ids    INT[]
) RETURNS SETOF public.group_sessions AS $$
BEGIN
  RETURN QUERY
  UPDATE public.group_sessions
  SET
    status = 'final_voting',
    finalist_tmdb_ids = p_finalist_ids,
    final_votes = '{}'::jsonb,
    updated_at = now()
  WHERE id = p_session_id AND status = 'swiping'
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. Atomic CAS: final_voting → completed (for finalize) ──────────
-- Sets the winner and status in one atomic op.
-- Returns the updated row if CAS succeeded, empty set otherwise.

CREATE OR REPLACE FUNCTION public.group_finalize_winner(
  p_session_id       UUID,
  p_tmdb_id          INT,
  p_media_type       TEXT
) RETURNS SETOF public.group_sessions AS $$
BEGIN
  RETURN QUERY
  UPDATE public.group_sessions
  SET
    status = 'completed',
    final_pick_tmdb_id = p_tmdb_id,
    final_pick_media_type = p_media_type,
    updated_at = now()
  WHERE id = p_session_id AND status = 'final_voting'
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
