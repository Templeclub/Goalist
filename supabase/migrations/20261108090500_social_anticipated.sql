-- Community features are NOT built yet. These tables exist so the model and the
-- account-deletion rules are right from the start. RLS is enabled with no policy:
-- nobody but the service role can read or write them until the community phase.

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followee_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create table public.circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 60),
  created_at timestamptz not null default now()
);

create table public.circle_members (
  circle_id uuid not null references public.circles (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (circle_id, member_id)
);

create index circle_members_member_idx on public.circle_members (member_id);

create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind ~ '^[a-z_]{2,30}$'),
  created_at timestamptz not null default now(),
  unique (goal_id, author_id, kind)
);

-- Content written on other people's goals survives account deletion anonymised.
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.contribution_offers (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  message text check (char_length(message) <= 1000),
  status text not null default 'open' check (status in ('open', 'accepted', 'declined', 'withdrawn')),
  created_at timestamptz not null default now()
);

create table public.interest_signals (
  goal_id uuid not null references public.goals (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (goal_id, user_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles (id) on delete set null,
  target_type text not null check (target_type in ('goal', 'comment', 'profile')),
  target_id uuid not null,
  reason text not null check (char_length(reason) <= 1000),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.follows enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.reactions enable row level security;
alter table public.comments enable row level security;
alter table public.contribution_offers enable row level security;
alter table public.interest_signals enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;

-- ---------------------------------------------------------------------------
-- Sharing rules, modelled now and closed by the `sharing_enabled` flag.
-- ---------------------------------------------------------------------------

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
  if viewer is null or target_visibility = 'private' or not public.app_flag('sharing_enabled') then
    return false;
  end if;

  -- Never visible across a block, in either direction.
  if exists (
    select 1 from public.blocks b
    where (b.blocker_id = target_owner_id and b.blocked_id = viewer)
       or (b.blocker_id = viewer and b.blocked_id = target_owner_id)
  ) then
    return false;
  end if;

  if target_visibility = 'community' then
    return not public.is_anonymous();
  end if;

  if target_visibility = 'circle' then
    return exists (
      select 1
      from public.circles c
      join public.circle_members m on m.circle_id = c.id
      where c.owner_id = target_owner_id and m.member_id = viewer
    );
  end if;

  return false;
end;
$$;

revoke all on function public.goal_shared_with_me(uuid, text) from public, anon;
grant execute on function public.goal_shared_with_me(uuid, text) to authenticated;

drop policy goals_select_own on public.goals;

create policy goals_select on public.goals
  for select to authenticated
  using (
    owner_id = (select auth.uid())
    or (visibility <> 'private' and deleted_at is null and public.goal_shared_with_me(owner_id, visibility))
  );
