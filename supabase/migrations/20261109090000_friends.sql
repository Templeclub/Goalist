-- Friends (D-064): mutual friendships made through a personal invite link, cards shared
-- with friends one by one, and the interactions anticipated in 20261108090500:
-- encouragements (reactions), messages (comments), « moi aussi » (interest signals) and
-- « je peux aider » (contribution offers). No directory, no public profile, accounts only.

-- ---------------------------------------------------------------------------
-- Friendships and invites
-- ---------------------------------------------------------------------------

-- One row per pair, the smaller id first: a friendship is always mutual.
create table public.friendships (
  user_low uuid not null references public.profiles (id) on delete cascade,
  user_high uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_low, user_high),
  check (user_low < user_high)
);

create index friendships_high_idx on public.friendships (user_high);

alter table public.friendships enable row level security;

create policy friendships_select on public.friendships
  for select to authenticated
  using ((select auth.uid()) in (user_low, user_high));

-- Either friend can end the friendship; making one goes through accept_friend_invite().
create policy friendships_delete on public.friendships
  for delete to authenticated
  using ((select auth.uid()) in (user_low, user_high));

-- One personal invite link per person; renewing it replaces the code.
create table public.friend_invites (
  owner_id uuid primary key references public.profiles (id) on delete cascade,
  code text not null unique check (code ~ '^[A-Za-z0-9_-]{16,64}$'),
  created_at timestamptz not null default now()
);

alter table public.friend_invites enable row level security;

create policy friend_invites_select_own on public.friend_invites
  for select to authenticated
  using (owner_id = (select auth.uid()));

create policy friend_invites_insert_own on public.friend_invites
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and not public.is_anonymous());

create policy friend_invites_update_own on public.friend_invites
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy friend_invites_delete_own on public.friend_invites
  for delete to authenticated
  using (owner_id = (select auth.uid()));

create or replace function public.are_friends(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.friendships f
    where f.user_low = least(a, b) and f.user_high = greatest(a, b)
  );
$$;

revoke all on function public.are_friends(uuid, uuid) from public, anon;
grant execute on function public.are_friends(uuid, uuid) to authenticated;

-- The viewer's friends with the only profile field they share: the pseudo.
create or replace function public.my_friends()
returns table (friend_id uuid, display_name text, since timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.display_name, f.created_at
  from public.friendships f
  join public.profiles p
    on p.id = case when f.user_low = auth.uid() then f.user_high else f.user_low end
  where auth.uid() in (f.user_low, f.user_high)
  order by f.created_at desc;
$$;

revoke all on function public.my_friends() from public, anon;
grant execute on function public.my_friends() to authenticated;

-- Who sent this link: shown on the invite page, to anyone holding the code.
create or replace function public.invite_preview(invite_code text)
returns table (owner_id uuid, display_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select i.owner_id, p.display_name
  from public.friend_invites i
  join public.profiles p on p.id = i.owner_id
  where i.code = invite_code;
$$;

revoke all on function public.invite_preview(text) from public;
grant execute on function public.invite_preview(text) to anon, authenticated;

-- Accepting a link makes the two people friends (idempotent). Returns the new friend.
create or replace function public.accept_friend_invite(invite_code text)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  viewer uuid := auth.uid();
  inviter uuid;
begin
  if viewer is null or public.is_anonymous() then
    raise exception 'account_required' using errcode = '42501';
  end if;

  select i.owner_id into inviter from public.friend_invites i where i.code = invite_code;
  if inviter is null then
    raise exception 'invite_not_found' using errcode = 'P0002';
  end if;
  if inviter = viewer then
    raise exception 'own_invite' using errcode = '22023';
  end if;
  -- A block, in either direction, looks like an unknown link.
  if exists (
    select 1 from public.blocks b
    where (b.blocker_id = inviter and b.blocked_id = viewer)
       or (b.blocker_id = viewer and b.blocked_id = inviter)
  ) then
    raise exception 'invite_not_found' using errcode = 'P0002';
  end if;

  insert into public.friendships (user_low, user_high)
  values (least(viewer, inviter), greatest(viewer, inviter))
  on conflict do nothing;

  return inviter;
end;
$$;

revoke all on function public.accept_friend_invite(text) from public, anon;
grant execute on function public.accept_friend_invite(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Sharing a card with friends
-- ---------------------------------------------------------------------------

update public.app_flags set enabled = true where key = 'sharing_enabled';

-- « circle » now means « mes amis ». « community » stays closed whatever the flag.
create or replace function public.goal_shared_with_me(
  target_owner_id uuid,
  target_visibility text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  viewer uuid := auth.uid();
begin
  if viewer is null
     or target_visibility <> 'circle'
     or public.is_anonymous()
     or not public.app_flag('sharing_enabled') then
    return false;
  end if;

  if exists (
    select 1 from public.blocks b
    where (b.blocker_id = target_owner_id and b.blocked_id = viewer)
       or (b.blocker_id = viewer and b.blocked_id = target_owner_id)
  ) then
    return false;
  end if;

  return public.are_friends(target_owner_id, viewer);
end;
$$;

drop policy goals_insert_own on public.goals;
drop policy goals_update_own on public.goals;

create policy goals_insert_own on public.goals
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and (visibility = 'private' or (visibility = 'circle' and public.app_flag('sharing_enabled')))
    and public.can_create_goal()
  );

create policy goals_update_own on public.goals
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    and (visibility = 'private' or (visibility = 'circle' and public.app_flag('sharing_enabled')))
  );

-- A friend's card the viewer can interact with (not their own, shared, not deleted).
create or replace function public.is_friend_goal(target_goal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.goals g
    where g.id = target_goal_id
      and g.deleted_at is null
      and g.owner_id <> auth.uid()
      and public.goal_shared_with_me(g.owner_id, g.visibility)
  );
$$;

revoke all on function public.is_friend_goal(uuid) from public, anon;
grant execute on function public.is_friend_goal(uuid) to authenticated;

-- Friends see the series of a shared card.
create policy goal_categories_select_shared on public.goal_categories
  for select to authenticated
  using (public.is_friend_goal(goal_id));

-- ---------------------------------------------------------------------------
-- Interactions on a friend's card
-- ---------------------------------------------------------------------------

-- Encouragements: a short, fixed set.
alter table public.reactions
  add constraint reactions_kind_known check (kind in ('bravo', 'courage', 'inspire'));

create policy reactions_select on public.reactions
  for select to authenticated
  using (public.is_goal_owner(goal_id) or public.is_friend_goal(goal_id));

create policy reactions_insert on public.reactions
  for insert to authenticated
  with check (author_id = (select auth.uid()) and public.is_friend_goal(goal_id));

create policy reactions_delete_own on public.reactions
  for delete to authenticated
  using (author_id = (select auth.uid()));

-- Messages: short; removable by their author or by the card's owner.
alter table public.comments
  add constraint comments_body_short check (char_length(body) <= 500);

create policy comments_select on public.comments
  for select to authenticated
  using (
    deleted_at is null
    and (public.is_goal_owner(goal_id) or public.is_friend_goal(goal_id))
  );

create policy comments_insert on public.comments
  for insert to authenticated
  with check (author_id = (select auth.uid()) and public.is_friend_goal(goal_id));

create policy comments_delete on public.comments
  for delete to authenticated
  using (author_id = (select auth.uid()) or public.is_goal_owner(goal_id));

revoke update on public.comments from authenticated;

-- « Moi aussi »
create policy interest_signals_select on public.interest_signals
  for select to authenticated
  using (public.is_goal_owner(goal_id) or public.is_friend_goal(goal_id));

create policy interest_signals_insert on public.interest_signals
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_friend_goal(goal_id));

create policy interest_signals_delete_own on public.interest_signals
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- « Je peux aider »: seen by its author and the card's owner only.
create policy contribution_offers_select on public.contribution_offers
  for select to authenticated
  using (author_id = (select auth.uid()) or public.is_goal_owner(goal_id));

create policy contribution_offers_insert on public.contribution_offers
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and status = 'open'
    and public.is_friend_goal(goal_id)
  );

-- The owner answers (accepted / declined / open again); the author can withdraw.
create policy contribution_offers_update on public.contribution_offers
  for update to authenticated
  using (author_id = (select auth.uid()) or public.is_goal_owner(goal_id))
  with check (
    (public.is_goal_owner(goal_id) and status in ('open', 'accepted', 'declined'))
    or (author_id = (select auth.uid()) and status = 'withdrawn')
  );

revoke update on public.contribution_offers from authenticated;
grant update (status) on public.contribution_offers to authenticated;
