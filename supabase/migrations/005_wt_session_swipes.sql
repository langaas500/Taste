-- Migration 005: atomic per-row swipe storage
-- Replaces the race-prone host_swipes/guest_swipes JSON columns in wt_sessions.

CREATE TABLE IF NOT EXISTS wt_session_swipes (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id  UUID         NOT NULL,
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id     INTEGER      NOT NULL,
  media_type  TEXT         NOT NULL CHECK (media_type IN ('movie', 'tv')),
  decision    TEXT         NOT NULL CHECK (decision IN ('like', 'nope', 'meh', 'superlike')),
  created_at  TIMESTAMPTZ  DEFAULT NOW(),
  CONSTRAINT wt_session_swipes_unique UNIQUE (session_id, user_id, tmdb_id, media_type)
);

CREATE INDEX IF NOT EXISTS idx_wt_session_swipes_session
  ON wt_session_swipes (session_id);

-- RLS
ALTER TABLE wt_session_swipes ENABLE ROW LEVEL SECURITY;

-- Users can upsert their own swipes
CREATE POLICY "Users can upsert own swipes"
  ON wt_session_swipes
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own swipes"
  ON wt_session_swipes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Session participants can read all swipes in their session
CREATE POLICY "Session participants can read swipes"
  ON wt_session_swipes
  FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT id FROM wt_sessions
      WHERE host_id = auth.uid() OR guest_id = auth.uid()
    )
  );
