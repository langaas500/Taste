-- Watch Bank: expand status check to include 'watching'
ALTER TABLE public.user_titles DROP CONSTRAINT IF EXISTS user_titles_status_check;
ALTER TABLE public.user_titles ADD CONSTRAINT user_titles_status_check
  CHECK (status IN ('watched', 'watchlist', 'watching'));

-- Favorites: add boolean column
ALTER TABLE public.user_titles ADD COLUMN IF NOT EXISTS favorite boolean DEFAULT false;
