-- Add onboarding columns to profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS streaming_services jsonb DEFAULT '[]'::jsonb;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- ═══════════════════════════════════════════════════════
-- SOCIAL LOGIN SETUP (Google + Apple)
-- ═══════════════════════════════════════════════════════
-- No SQL changes needed — configure in Supabase Dashboard:
--
-- 1. Go to Supabase Dashboard → Authentication → Providers
-- 2. Enable Google:
--    - Client ID and Client Secret from Google Cloud Console
--    - In Google Cloud Console: add https://logflix.app and http://localhost:3000
--      as authorized JavaScript origins
--    - Add https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
--      as authorized redirect URI
-- 3. Enable Apple:
--    - Service ID, Team ID, Key ID, Private Key from Apple Developer
--    - Add https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
--      as redirect URL in Apple Developer
-- 4. Both providers use /api/auth/callback as the app-level redirect
--    which handles code exchange and onboarding routing automatically
