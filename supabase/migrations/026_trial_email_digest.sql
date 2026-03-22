-- Add trial and email digest columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_digest BOOLEAN DEFAULT false;
