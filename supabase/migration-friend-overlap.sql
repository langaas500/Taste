-- Migration: Allow linked users to read partner titles (for friend overlap feature)

-- Drop the existing restrictive policy
drop policy if exists "Users can read own titles" on public.user_titles;

-- Replace with a policy that also allows linked partners to read titles
create policy "Users and linked partners can read titles"
  on public.user_titles for select using (
    auth.uid() = user_id
    or exists (
      select 1 from public.account_links
      where status = 'accepted'
      and (
        (inviter_id = user_titles.user_id and invitee_id = auth.uid())
        or
        (invitee_id = user_titles.user_id and inviter_id = auth.uid())
      )
    )
  );
