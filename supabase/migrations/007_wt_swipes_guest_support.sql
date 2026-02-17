-- Migration 007: guest support in wt_session_swipes
-- user_id was NOT NULL FK to auth.users — guests have no auth row, so we add
-- a separate guest_id column and enforce exactly-one-non-null via CHECK.

-- 1. Make user_id nullable (keep FK for when it IS set)
ALTER TABLE wt_session_swipes ALTER COLUMN user_id DROP NOT NULL;

-- 2. Add guest_id for unauthenticated players
ALTER TABLE wt_session_swipes ADD COLUMN IF NOT EXISTS guest_id UUID;

-- 3. Exactly one of (user_id, guest_id) must be set
ALTER TABLE wt_session_swipes ADD CONSTRAINT wt_swipes_identity_check CHECK (
  (user_id IS NOT NULL AND guest_id IS NULL) OR
  (user_id IS NULL  AND guest_id IS NOT NULL)
);

-- 4. Drop old single unique constraint (cannot cover both columns)
ALTER TABLE wt_session_swipes DROP CONSTRAINT IF EXISTS wt_session_swipes_unique;

-- 5. Two partial unique indexes — one per identity type
CREATE UNIQUE INDEX IF NOT EXISTS idx_wt_swipes_auth_unique
  ON wt_session_swipes (session_id, user_id, tmdb_id, media_type)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_wt_swipes_guest_unique
  ON wt_session_swipes (session_id, guest_id, tmdb_id, media_type)
  WHERE guest_id IS NOT NULL;

-- 6. Update RLS so anon (guest) callers can also read/write
--    (routes use admin client which bypasses RLS anyway, but keep policies clean)
DROP POLICY IF EXISTS "Users can upsert own swipes"         ON wt_session_swipes;
DROP POLICY IF EXISTS "Users can update own swipes"         ON wt_session_swipes;
DROP POLICY IF EXISTS "Session participants can read swipes" ON wt_session_swipes;

-- Allow any caller — access control is enforced at the API layer
CREATE POLICY "Allow swipe insert"
  ON wt_session_swipes FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow swipe update"
  ON wt_session_swipes FOR UPDATE USING (true);

CREATE POLICY "Allow swipe read"
  ON wt_session_swipes FOR SELECT USING (true);
