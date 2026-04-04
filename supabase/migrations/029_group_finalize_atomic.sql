-- Migration 029: Atomic group finalize with vote counting inside Postgres
-- Fixes race condition where two concurrent finalize requests could
-- both read votes, compute different winners, and overwrite each other.

CREATE OR REPLACE FUNCTION public.group_finalize_winner_atomic(
  p_session_id UUID,
  p_host_user_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session RECORD;
  v_final_votes JSONB;
  v_votes JSONB;
  v_finalist_ids INT[];
  v_pool JSONB;
  v_user_id TEXT;
  v_tmdb_str TEXT;
  v_tmdb_id INT;
  v_key TEXT;
  v_vote TEXT;
  v_final_count INT;
  v_swipe_score INT;
  v_host_pick INT;
  v_best_tmdb_id INT;
  v_best_final INT := -1;
  v_best_swipe INT := -1;
  v_best_host INT := -1;
  v_best_media TEXT := 'movie';
  v_best_title TEXT := '';
  v_item JSONB;
BEGIN
  -- Lock the row to prevent concurrent finalization
  SELECT * INTO v_session
  FROM public.group_sessions
  WHERE id = p_session_id
    AND status = 'final_voting'
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Already completed or wrong status — return existing winner if completed
    SELECT final_pick_tmdb_id, final_pick_media_type INTO v_best_tmdb_id, v_best_media
    FROM public.group_sessions
    WHERE id = p_session_id AND status = 'completed';

    IF FOUND AND v_best_tmdb_id IS NOT NULL THEN
      RETURN jsonb_build_object('status', 'already_completed', 'winner_tmdb_id', v_best_tmdb_id, 'winner_media_type', v_best_media);
    END IF;
    RETURN jsonb_build_object('error', 'invalid_status');
  END IF;

  v_final_votes := v_session.final_votes;
  v_votes := v_session.votes;
  v_finalist_ids := v_session.finalist_tmdb_ids;
  v_pool := v_session.pool;

  -- Score each finalist
  FOR i IN 1..array_length(v_finalist_ids, 1) LOOP
    v_tmdb_id := v_finalist_ids[i];
    v_tmdb_str := v_tmdb_id::TEXT;

    -- Count final votes for this finalist
    v_final_count := 0;
    FOR v_user_id, v_vote IN SELECT key, value#>>'{}' FROM jsonb_each(v_final_votes) LOOP
      IF v_vote = v_tmdb_str THEN
        v_final_count := v_final_count + 1;
      END IF;
    END LOOP;

    -- Count swipe likes across all participants
    v_swipe_score := 0;
    FOR v_user_id IN SELECT key FROM jsonb_each(v_votes) LOOP
      FOR v_key, v_vote IN SELECT key, value#>>'{}' FROM jsonb_each(v_votes->v_user_id) LOOP
        IF split_part(v_key, ':', 1) = v_tmdb_str AND v_vote = 'liked' THEN
          v_swipe_score := v_swipe_score + 1;
        END IF;
      END LOOP;
    END LOOP;

    -- Host tiebreak
    v_host_pick := 0;
    IF v_final_votes->>p_host_user_id = v_tmdb_str THEN
      v_host_pick := 1;
    END IF;

    -- Compare: (final_count, swipe_score, host_pick) descending
    IF v_final_count > v_best_final
       OR (v_final_count = v_best_final AND v_swipe_score > v_best_swipe)
       OR (v_final_count = v_best_final AND v_swipe_score = v_best_swipe AND v_host_pick > v_best_host)
    THEN
      v_best_tmdb_id := v_tmdb_id;
      v_best_final := v_final_count;
      v_best_swipe := v_swipe_score;
      v_best_host := v_host_pick;
    END IF;
  END LOOP;

  -- Find media_type from pool
  IF v_pool IS NOT NULL THEN
    FOR v_item IN SELECT value FROM jsonb_array_elements(v_pool) LOOP
      IF (v_item->>'tmdb_id')::INT = v_best_tmdb_id THEN
        v_best_media := COALESCE(v_item->>'media_type', 'movie');
        v_best_title := COALESCE(v_item->>'title', '');
        EXIT;
      END IF;
    END LOOP;
  END IF;

  -- Atomic update
  UPDATE public.group_sessions
  SET
    status = 'completed',
    final_pick_tmdb_id = v_best_tmdb_id,
    final_pick_media_type = v_best_media,
    updated_at = now()
  WHERE id = p_session_id;

  RETURN jsonb_build_object(
    'status', 'finalized',
    'winner_tmdb_id', v_best_tmdb_id,
    'winner_media_type', v_best_media,
    'winner_title', v_best_title,
    'final_vote_count', v_best_final,
    'swipe_score', v_best_swipe
  );
END;
$$;
