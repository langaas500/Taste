-- Migration 011: Tighten RLS on group_sessions, group_session_participants, wt_session_swipes
--
-- Replaces USING (true) / WITH CHECK (true) with scoped policies.
-- All API routes use createSupabaseAdmin() (bypasses RLS); these policies
-- are defense-in-depth against direct anon-key access.
--
-- Circular reference (group_sessions ↔ group_session_participants) is
-- resolved via SECURITY DEFINER helper functions.

-- ══════════════════════════════════════════════════════════════════════
-- Helper functions (SECURITY DEFINER — bypass RLS in policy sub-queries)
-- ══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_group_host(p_session_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_sessions
    WHERE id = p_session_id
      AND host_user_id = auth.uid()::text
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_group_participant(p_session_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_session_participants
    WHERE session_id = p_session_id
      AND user_id = auth.uid()::text
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_wt_session_member(p_session_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.wt_sessions
    WHERE id = p_session_id
      AND (host_id = auth.uid() OR guest_id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ══════════════════════════════════════════════════════════════════════
-- 1. group_sessions
-- ══════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "group_sessions_allow_all" ON public.group_sessions;

-- SELECT: host or any participant in the session
CREATE POLICY "group_sessions_select"
  ON public.group_sessions FOR SELECT
  USING (
    host_user_id = auth.uid()::text
    OR is_group_participant(id)
  );

-- INSERT: only when you are the host
CREATE POLICY "group_sessions_insert"
  ON public.group_sessions FOR INSERT
  WITH CHECK (host_user_id = auth.uid()::text);

-- UPDATE: host or any participant (voting, state transitions)
CREATE POLICY "group_sessions_update"
  ON public.group_sessions FOR UPDATE
  USING (
    host_user_id = auth.uid()::text
    OR is_group_participant(id)
  );

-- No DELETE policy — only admin (cleanup) can delete.

-- ══════════════════════════════════════════════════════════════════════
-- 2. group_session_participants
-- ══════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "group_participants_allow_all" ON public.group_session_participants;

-- SELECT: host sees all participants; participants see all in their sessions
CREATE POLICY "group_participants_select"
  ON public.group_session_participants FOR SELECT
  USING (
    is_group_host(session_id)
    OR is_group_participant(session_id)
  );

-- INSERT: you can only add yourself
CREATE POLICY "group_participants_insert"
  ON public.group_session_participants FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- UPDATE: you can only modify your own row
CREATE POLICY "group_participants_update"
  ON public.group_session_participants FOR UPDATE
  USING (user_id = auth.uid()::text);

-- No DELETE policy — only admin / CASCADE can delete.

-- ══════════════════════════════════════════════════════════════════════
-- 3. wt_session_swipes
-- ══════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Allow swipe insert" ON public.wt_session_swipes;
DROP POLICY IF EXISTS "Allow swipe update" ON public.wt_session_swipes;
DROP POLICY IF EXISTS "Allow swipe read"   ON public.wt_session_swipes;

-- SELECT: host or guest of the parent wt_session
CREATE POLICY "wt_swipes_select"
  ON public.wt_session_swipes FOR SELECT
  USING (is_wt_session_member(session_id));

-- INSERT: host or guest of the parent wt_session
CREATE POLICY "wt_swipes_insert"
  ON public.wt_session_swipes FOR INSERT
  WITH CHECK (is_wt_session_member(session_id));

-- UPDATE: host or guest of the parent wt_session
CREATE POLICY "wt_swipes_update"
  ON public.wt_session_swipes FOR UPDATE
  USING (is_wt_session_member(session_id));

-- No DELETE policy — only admin (cleanup) can delete.
