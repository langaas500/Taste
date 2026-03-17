-- Lokalisert curator-tekst per tittel og språk (nb/sv/da/fi)
-- Separerer fra titles_cache slik at eksisterende norsk tekst ikke påvirkes.
-- Eksisterende titles_cache.curator_hook/body/verdict forblir som nb-fallback.

CREATE TABLE IF NOT EXISTS titles_cache_i18n (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('movie', 'tv')),
  locale TEXT NOT NULL CHECK (locale IN ('nb', 'sv', 'da', 'fi')),
  curator_hook TEXT,
  curator_body TEXT,
  curator_verdict TEXT,
  mood_tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tmdb_id, type, locale)
);

CREATE INDEX IF NOT EXISTS idx_titles_cache_i18n_lookup
  ON titles_cache_i18n (tmdb_id, type, locale);

ALTER TABLE titles_cache_i18n ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'titles_cache_i18n' AND policyname = 'Public read'
  ) THEN
    CREATE POLICY "Public read" ON titles_cache_i18n
      FOR SELECT USING (true);
  END IF;
END $$;
