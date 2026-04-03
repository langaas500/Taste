-- Add preferred_locale column to profiles
-- NULL = auto-detect from IP (backward compatible)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_locale TEXT DEFAULT NULL;
