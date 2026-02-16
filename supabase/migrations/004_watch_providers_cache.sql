-- Kjør denne manuelt i Supabase SQL Editor / Dashboard
-- Oppretter watch_providers_cache for å cache TMDB provider-data per tittel og land

CREATE TABLE IF NOT EXISTS public.watch_providers_cache (
  tmdb_id    INT          NOT NULL,
  type       TEXT         NOT NULL CHECK (type IN ('movie', 'tv')),
  country    TEXT         NOT NULL,
  providers  JSONB,
  cached_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  PRIMARY KEY (tmdb_id, type, country)
);

-- Ingen RLS — kun tilgang via service role (createSupabaseAdmin)
-- Service role bypasser RLS uansett, så vi aktiverer ikke RLS på denne tabellen.

-- Index for batch-queries: hent mange titler for ett land
CREATE INDEX IF NOT EXISTS idx_wpc_country_type
  ON public.watch_providers_cache (country, type);

-- Index for TTL-basert opprydding (valgfritt, for fremtidig cron)
CREATE INDEX IF NOT EXISTS idx_wpc_cached_at
  ON public.watch_providers_cache (cached_at);
