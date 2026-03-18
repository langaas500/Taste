-- Allow solo users to have tonight's picks (no partner link required)

-- 1. Add user_id column
ALTER TABLE couple_picks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Make link_id nullable for solo picks
ALTER TABLE couple_picks ALTER COLUMN link_id DROP NOT NULL;

-- 3. Drop the old unique constraint and replace with one that supports solo
ALTER TABLE couple_picks DROP CONSTRAINT IF EXISTS couple_picks_link_id_generated_at_key;

-- New unique: one pick per user per day
ALTER TABLE couple_picks ADD CONSTRAINT couple_picks_user_date_key UNIQUE (user_id, generated_at);

-- 4. Index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_couple_picks_user_date
  ON couple_picks (user_id, generated_at DESC);

-- 5. Update RLS to also allow solo users to read their own picks
DROP POLICY IF EXISTS "Users can read own couple picks" ON couple_picks;

CREATE POLICY "Users can read own couple picks"
  ON couple_picks FOR SELECT
  USING (
    user_id = auth.uid()
    OR link_id IN (
      SELECT id FROM account_links
      WHERE inviter_id = auth.uid()
      OR invitee_id = auth.uid()
    )
  );
