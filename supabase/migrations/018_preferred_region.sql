-- Add preferred_region column to profiles for global region persistence
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_region TEXT DEFAULT NULL;

-- Index for quick lookups (optional, profiles is small)
COMMENT ON COLUMN profiles.preferred_region IS 'ISO 3166-1 alpha-2 country code (e.g. NO, US, DE). NULL = not yet set.';
