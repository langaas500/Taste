-- Add expires_at to wt_sessions for session code TTL
ALTER TABLE wt_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Set default for new sessions: 24 hours from creation
ALTER TABLE wt_sessions ALTER COLUMN expires_at SET DEFAULT (now() + interval '24 hours');

-- Backfill existing sessions: give them 24 hours from now
UPDATE wt_sessions SET expires_at = now() + interval '24 hours' WHERE expires_at IS NULL;
