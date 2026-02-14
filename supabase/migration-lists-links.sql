-- Custom Lists & Account Linking
-- Run this in your Supabase SQL Editor after migration.sql

-- ================================================================
-- 7. Custom Lists
-- ================================================================
create table if not exists public.custom_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  description text,
  position int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.custom_lists enable row level security;

create policy "Users can read own lists"
  on public.custom_lists for select using (auth.uid() = user_id);
create policy "Users can insert own lists"
  on public.custom_lists for insert with check (auth.uid() = user_id);
create policy "Users can update own lists"
  on public.custom_lists for update using (auth.uid() = user_id);
create policy "Users can delete own lists"
  on public.custom_lists for delete using (auth.uid() = user_id);

create index if not exists idx_custom_lists_user on public.custom_lists (user_id);

-- ================================================================
-- 8. Custom List Items
-- ================================================================
create table if not exists public.custom_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.custom_lists on delete cascade,
  tmdb_id int not null,
  type text not null check (type in ('movie', 'tv')),
  position int not null default 0,
  added_at timestamptz default now(),
  unique (list_id, tmdb_id, type)
);

alter table public.custom_list_items enable row level security;

create policy "Users can read own list items"
  on public.custom_list_items for select using (
    exists (select 1 from public.custom_lists where custom_lists.id = custom_list_items.list_id and custom_lists.user_id = auth.uid())
  );
create policy "Users can insert into own lists"
  on public.custom_list_items for insert with check (
    exists (select 1 from public.custom_lists where custom_lists.id = custom_list_items.list_id and custom_lists.user_id = auth.uid())
  );
create policy "Users can delete from own lists"
  on public.custom_list_items for delete using (
    exists (select 1 from public.custom_lists where custom_lists.id = custom_list_items.list_id and custom_lists.user_id = auth.uid())
  );

create index if not exists idx_custom_list_items_list on public.custom_list_items (list_id);

-- ================================================================
-- 9. Account Links
-- ================================================================
create table if not exists public.account_links (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references auth.users on delete cascade,
  invitee_id uuid references auth.users on delete cascade,
  invite_code text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  shared_list_ids uuid[] default '{}',
  created_at timestamptz default now(),
  accepted_at timestamptz
);

alter table public.account_links enable row level security;

create policy "Inviter can read own links"
  on public.account_links for select using (auth.uid() = inviter_id);
create policy "Invitee can read own links"
  on public.account_links for select using (auth.uid() = invitee_id);
create policy "Anyone can read pending by code"
  on public.account_links for select using (status = 'pending');
create policy "Inviter can insert links"
  on public.account_links for insert with check (auth.uid() = inviter_id);
create policy "Inviter can update own links"
  on public.account_links for update using (auth.uid() = inviter_id);
create policy "Invitee can update assigned links"
  on public.account_links for update using (auth.uid() = invitee_id);
create policy "Inviter can delete own links"
  on public.account_links for delete using (auth.uid() = inviter_id);

create index if not exists idx_account_links_inviter on public.account_links (inviter_id);
create index if not exists idx_account_links_invitee on public.account_links (invitee_id);
create index if not exists idx_account_links_code on public.account_links (invite_code);

-- ================================================================
-- Additional RLS: Linked users can read shared lists & items
-- ================================================================
create policy "Linked users can read shared lists"
  on public.custom_lists for select using (
    exists (
      select 1 from public.account_links
      where account_links.status = 'accepted'
      and (
        (account_links.inviter_id = custom_lists.user_id and account_links.invitee_id = auth.uid())
        or
        (account_links.invitee_id = custom_lists.user_id and account_links.inviter_id = auth.uid())
      )
      and custom_lists.id = any(account_links.shared_list_ids)
    )
  );

create policy "Linked users can read shared list items"
  on public.custom_list_items for select using (
    exists (
      select 1 from public.custom_lists
      join public.account_links on (
        (account_links.inviter_id = custom_lists.user_id and account_links.invitee_id = auth.uid())
        or
        (account_links.invitee_id = custom_lists.user_id and account_links.inviter_id = auth.uid())
      )
      where custom_lists.id = custom_list_items.list_id
      and account_links.status = 'accepted'
      and custom_lists.id = any(account_links.shared_list_ids)
    )
  );
