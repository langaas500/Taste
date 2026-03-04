-- Grant permanent premium to admin/founder accounts
-- Safe: no stripe_customer_id → webhook will never overwrite
UPDATE profiles
SET is_premium = true,
    founding_member = true,
    premium_since = NOW()
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('martinrlangaas@protonmail.com', 'emmelin8@hotmail.com')
);
