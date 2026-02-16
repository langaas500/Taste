-- Kjør denne manuelt i Supabase SQL Editor / Dashboard
-- Legger til Netflix-ID kolonner i titles_cache for deep linking

ALTER TABLE titles_cache
  ADD COLUMN IF NOT EXISTS netflix_id TEXT,
  ADD COLUMN IF NOT EXISTS netflix_id_checked BOOLEAN DEFAULT false;

-- Index for raskere lookups
CREATE INDEX IF NOT EXISTS idx_titles_cache_netflix_id
  ON titles_cache (netflix_id) WHERE netflix_id IS NOT NULL;
