-- SEO title pages: slug, curator content, and mood tags
-- Supports /[region]/movie/[slug] and /[region]/tv/[slug] routes

ALTER TABLE titles_cache
  ADD COLUMN IF NOT EXISTS slug           TEXT,
  ADD COLUMN IF NOT EXISTS curator_hook    TEXT,
  ADD COLUMN IF NOT EXISTS curator_body    TEXT,
  ADD COLUMN IF NOT EXISTS curator_verdict TEXT,
  ADD COLUMN IF NOT EXISTS mood_tags       TEXT[];

-- Unique slug per media type (allows same slug for movie vs tv)
CREATE UNIQUE INDEX IF NOT EXISTS idx_titles_cache_slug_type
  ON titles_cache(slug, type) WHERE slug IS NOT NULL;
