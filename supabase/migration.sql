-- WatchLedger Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  language text default 'en',
  exploration_slider int default 50 check (exploration_slider >= 0 and exploration_slider <= 100),
  taste_summary jsonb,
  taste_summary_updated_at timestamptz,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Titles Cache (shared, server-written)
create table if not exists public.titles_cache (
  tmdb_id int not null,
  type text not null check (type in ('movie', 'tv')),
  imdb_id text,
  title text not null,
  original_title text,
  year int,
  overview text,
  genres jsonb default '[]',
  poster_path text,
  backdrop_path text,
  vote_average float,
  vote_count int,
  popularity float,
  tmdb_payload jsonb,
  updated_at timestamptz default now(),
  primary key (tmdb_id, type)
);

alter table public.titles_cache enable row level security;

create policy "Logged in users can read titles cache"
  on public.titles_cache for select using (auth.role() = 'authenticated');

-- Server writes via service role key (bypasses RLS)

-- 3. User Titles
create table if not exists public.user_titles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  tmdb_id int not null,
  type text not null check (type in ('movie', 'tv')),
  status text not null check (status in ('watched', 'watchlist')),
  sentiment text check (sentiment in ('liked', 'disliked', 'neutral')),
  rating int check (rating >= 1 and rating <= 10),
  note text,
  last_season int,
  last_episode int,
  watched_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, tmdb_id, type)
);

alter table public.user_titles enable row level security;

create policy "Users can read own titles"
  on public.user_titles for select using (auth.uid() = user_id);
create policy "Users can insert own titles"
  on public.user_titles for insert with check (auth.uid() = user_id);
create policy "Users can update own titles"
  on public.user_titles for update using (auth.uid() = user_id);
create policy "Users can delete own titles"
  on public.user_titles for delete using (auth.uid() = user_id);

-- 4. Trakt Tokens (server-only, no RLS select for users)
create table if not exists public.trakt_tokens (
  user_id uuid primary key references auth.users on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scope text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.trakt_tokens enable row level security;
-- No user-facing policies: only accessed via service role key on server

-- 5. User Exclusions
create table if not exists public.user_exclusions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  tmdb_id int not null,
  type text not null check (type in ('movie', 'tv')),
  reason text,
  created_at timestamptz default now(),
  unique (user_id, tmdb_id, type)
);

alter table public.user_exclusions enable row level security;

create policy "Users can read own exclusions"
  on public.user_exclusions for select using (auth.uid() = user_id);
create policy "Users can insert own exclusions"
  on public.user_exclusions for insert with check (auth.uid() = user_id);
create policy "Users can delete own exclusions"
  on public.user_exclusions for delete using (auth.uid() = user_id);

-- 6. User Feedback (on recommendations)
create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  tmdb_id int not null,
  type text not null check (type in ('movie', 'tv')),
  feedback text not null check (feedback in ('like_suggestion', 'not_for_me')),
  created_at timestamptz default now(),
  unique (user_id, tmdb_id, type)
);

alter table public.user_feedback enable row level security;

create policy "Users can read own feedback"
  on public.user_feedback for select using (auth.uid() = user_id);
create policy "Users can insert own feedback"
  on public.user_feedback for insert with check (auth.uid() = user_id);
create policy "Users can update own feedback"
  on public.user_feedback for update using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_user_titles_user on public.user_titles (user_id);
create index if not exists idx_user_titles_tmdb on public.user_titles (tmdb_id, type);
create index if not exists idx_user_exclusions_user on public.user_exclusions (user_id);
create index if not exists idx_user_feedback_user on public.user_feedback (user_id);
create index if not exists idx_titles_cache_updated on public.titles_cache (updated_at);
