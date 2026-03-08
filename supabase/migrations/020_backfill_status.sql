-- Backfill status tracking for cron-based slug/curator generation.
-- Allows resume on crash and prevents duplicate processing.

ALTER TABLE titles_cache
  ADD COLUMN IF NOT EXISTS backfill_status TEXT DEFAULT 'pending';

-- Add CHECK constraint separately (IF NOT EXISTS not supported for constraints)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'titles_cache_backfill_status_check'
  ) THEN
    ALTER TABLE titles_cache
      ADD CONSTRAINT titles_cache_backfill_status_check
      CHECK (backfill_status IN ('pending', 'processing', 'completed', 'failed'));
  END IF;
END $$;

-- Index for cron queries: find pending/failed titles quickly
CREATE INDEX IF NOT EXISTS idx_titles_cache_backfill_status
  ON titles_cache(backfill_status) WHERE backfill_status IN ('pending', 'failed');
