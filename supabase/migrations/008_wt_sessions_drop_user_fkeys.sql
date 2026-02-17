-- Migration 008: drop auth.users FK constraints on wt_sessions
-- host_id and guest_id can now hold guest UUIDs that are not in auth.users.
-- Access control is enforced at the API layer (getWtUserId + admin client).

ALTER TABLE public.wt_sessions
  DROP CONSTRAINT IF EXISTS wt_sessions_host_id_fkey;

ALTER TABLE public.wt_sessions
  DROP CONSTRAINT IF EXISTS wt_sessions_guest_id_fkey;
