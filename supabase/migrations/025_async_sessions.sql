-- Async Se Sammen: allow solo users to swipe now, send deck to partner, match later
ALTER TABLE wt_sessions ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'live';
ALTER TABLE wt_sessions ADD COLUMN IF NOT EXISTS async_deadline TIMESTAMPTZ;
ALTER TABLE wt_sessions ADD COLUMN IF NOT EXISTS async_deck JSONB;

COMMENT ON COLUMN wt_sessions.session_type IS 'live (default) or async';
COMMENT ON COLUMN wt_sessions.async_deadline IS 'Partner must swipe before this time (24h from creation)';
COMMENT ON COLUMN wt_sessions.async_deck IS 'Snapshot of deck titles for async sessions';
