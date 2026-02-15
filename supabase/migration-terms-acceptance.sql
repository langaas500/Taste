-- Add terms acceptance columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS terms_version text;

-- Update trigger to read terms metadata from signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, terms_accepted_at, terms_version)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    (new.raw_user_meta_data->>'terms_accepted_at')::timestamptz,
    new.raw_user_meta_data->>'terms_version'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
