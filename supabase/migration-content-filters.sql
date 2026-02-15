-- Content Filters Migration
-- Adds a JSONB column for persistent content filtering preferences
-- Run this in your Supabase SQL Editor

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS content_filters jsonb DEFAULT '{}';

-- Example usage:
-- {
--   "excluded_languages": ["ja", "ko", "zh", "th", "hi", "sv"],
--   "excluded_genres": [16],
--   "preferred_languages": ["en", "no"]
-- }
