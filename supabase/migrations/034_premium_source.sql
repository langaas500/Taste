-- Add premium_source column to track whether premium was purchased via Stripe or Apple IAP
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS premium_source TEXT;

-- Backfill existing Stripe subscribers
UPDATE profiles SET premium_source = 'stripe' WHERE is_premium = true AND stripe_subscription_id IS NOT NULL AND premium_source IS NULL;
