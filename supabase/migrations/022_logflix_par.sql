-- Logflix Par: partner premium sharing + daily couple picks

-- 1. Partner premium flag on account_links
ALTER TABLE account_links
ADD COLUMN IF NOT EXISTS partner_premium BOOLEAN DEFAULT false;

-- 2. Couple picks table (daily movie + series pick per couple)
CREATE TABLE IF NOT EXISTS couple_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES account_links(id) ON DELETE CASCADE,
  movie_tmdb_id INTEGER,
  movie_type TEXT CHECK (movie_type IN ('movie','tv')),
  movie_title TEXT,
  movie_poster_path TEXT,
  movie_match_score INTEGER,
  series_tmdb_id INTEGER,
  series_type TEXT CHECK (series_type IN ('movie','tv')),
  series_title TEXT,
  series_poster_path TEXT,
  series_match_score INTEGER,
  generated_at DATE NOT NULL DEFAULT CURRENT_DATE,
  reroll_count INTEGER DEFAULT 0,
  picked_at TIMESTAMPTZ,
  UNIQUE (link_id, generated_at)
);

CREATE INDEX IF NOT EXISTS idx_couple_picks_link_date
  ON couple_picks (link_id, generated_at DESC);

ALTER TABLE couple_picks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own couple picks'
  ) THEN
    CREATE POLICY "Users can read own couple picks"
      ON couple_picks FOR SELECT
      USING (
        link_id IN (
          SELECT id FROM account_links
          WHERE inviter_id = auth.uid()
          OR invitee_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 3. Partner user ID on profiles (for quick partner lookup)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS partner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
