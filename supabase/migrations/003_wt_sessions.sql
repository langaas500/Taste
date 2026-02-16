-- Watch Together sessions
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.wt_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  host_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  guest_id UUID REFERENCES auth.users ON DELETE SET NULL,
  titles JSONB NOT NULL DEFAULT '[]',
  host_swipes JSONB NOT NULL DEFAULT '{}',
  guest_swipes JSONB NOT NULL DEFAULT '{}',
  match_tmdb_id INT,
  match_type TEXT CHECK (match_type IN ('movie', 'tv')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'matched', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.wt_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read sessions they are part of"
  ON public.wt_sessions FOR SELECT
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

CREATE POLICY "Users can create sessions"
  ON public.wt_sessions FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Users can update sessions they are part of"
  ON public.wt_sessions FOR UPDATE
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- Index for code lookups
CREATE INDEX IF NOT EXISTS idx_wt_sessions_code ON public.wt_sessions (code);
CREATE INDEX IF NOT EXISTS idx_wt_sessions_host ON public.wt_sessions (host_id);
CREATE INDEX IF NOT EXISTS idx_wt_sessions_status ON public.wt_sessions (status) WHERE status IN ('waiting', 'active');
