-- Migration 013: Add archived_at to wt_sessions
-- Sessions are never deleted — only archived when status = completed.
-- Co-preference data (swipes) is retained for taste graph analysis.

ALTER TABLE public.wt_sessions
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
