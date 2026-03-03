-- Migration 011: Replace global UNIQUE on session code with partial unique index
-- Allows code reuse after sessions complete/expire, while preventing collisions
-- among active sessions.

-- ── 1. wt_sessions ────────────────────────────────────────────────
-- Drop the global unique constraint (code can be reused after session ends)
ALTER TABLE public.wt_sessions DROP CONSTRAINT IF EXISTS wt_sessions_code_key;

-- Partial unique: code must be unique among waiting/active sessions only
CREATE UNIQUE INDEX IF NOT EXISTS idx_wt_sessions_code_active
  ON public.wt_sessions (code)
  WHERE status IN ('waiting', 'active');

-- ── 2. group_sessions ─────────────────────────────────────────────
-- Drop the global unique constraint
ALTER TABLE public.group_sessions DROP CONSTRAINT IF EXISTS group_sessions_code_key;

-- Partial unique: code must be unique among lobby/swiping/final_voting sessions
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_sessions_code_active
  ON public.group_sessions (code)
  WHERE status IN ('lobby', 'swiping', 'final_voting');
