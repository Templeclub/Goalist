-- Goals ("envies"): the heart of the product. Only the title is required.
-- Enumerations are text + CHECK (D-009); keep them in sync with src/features/goals/schema.ts.

create table public.goals (
  -- Client-generated UUIDv7 so offline creation is idempotent (D-004).
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,

  -- 1. Name
  title text not null check (char_length(btrim(title)) between 1 and 120),
  tagline text check (char_length(tagline) <= 160),
  emoji text check (char_length(emoji) <= 16),
  hue smallint check (hue in (0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330)),

  -- 2. Describe
  description_doc jsonb check (description_doc is null or jsonb_typeof(description_doc) = 'object'),
  description_text text check (char_length(description_text) <= 20000),
  imagined_outcome text check (char_length(imagined_outcome) <= 4000),
  where_with text check (char_length(where_with) <= 1000),

  -- 3. Why
  why text check (char_length(why) <= 4000),
  benefits text check (char_length(benefits) <= 4000),

  -- 6. First steps
  first_step text check (char_length(first_step) <= 300),
  notes text check (char_length(notes) <= 10000),

  -- Lifecycle
  status text not null default 'idea'
    check (status in ('idea', 'confirmed', 'preparing', 'in_progress', 'done', 'paused', 'let_go')),
  status_changed_at timestamptz not null default now(),
  visibility text not null default 'private' check (visibility in ('private', 'circle', 'community')),

  -- 5. Qualify (all optional)
  difficulty smallint check (difficulty between 1 and 5),
  preparation text check (preparation in ('none', 'light', 'medium', 'heavy', 'very_heavy')),
  horizon text check (horizon in ('short', 'medium', 'long', 'someday')),
  target_date date,
  target_precision text check (target_precision in ('day', 'month', 'season', 'year')),
  energy text check (energy in ('low', 'medium', 'high')),
  budget_level text check (budget_level in ('none', 'low', 'medium', 'high')),
  budget_min_cents integer check (budget_min_cents >= 0),
  budget_max_cents integer check (budget_max_cents >= 0),
  currency char(3) not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  time_estimate text check (time_estimate in ('minutes', 'day', 'weekend', 'several_days', 'spread')),
  mode text check (mode in ('solo', 'together', 'open')),
  seasons text[] not null default '{}'
    check (seasons <@ array['spring', 'summer', 'autumn', 'winter', 'weekend', 'holidays', 'when_free']::text[]),
  place text check (char_length(place) <= 200),

  -- Capture and completeness (computed by the server, D-021)
  capture_mode text not null default 'express' check (capture_mode in ('express', 'full')),
  completeness_level text not null default 'sketch'
    check (completeness_level in ('sketch', 'on_track', 'well_filled')),
  missing_sections text[] not null default '{}',
  completion_dismissed_at timestamptz,

  -- Concurrency, search, trash
  version integer not null default 1,
  search_extra text not null default '',
  search_vector tsvector,
  deleted_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint goals_target_precision_needs_date check (target_precision is null or target_date is not null),
  constraint goals_budget_range check (
    budget_min_cents is null or budget_max_cents is null or budget_min_cents <= budget_max_cents
  )
);

comment on table public.goals is 'A wish, project or goal. Only the title is required.';
comment on column public.goals.version is 'Incremented on every update; clients send it as baseVersion (D-005).';
comment on column public.goals.search_extra is 'Denormalised tag and category labels for full-text search.';

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function public.goals_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.id <> old.id or new.owner_id <> old.owner_id then
      raise exception 'goal id and owner are immutable' using errcode = '42501';
    end if;
    new.version := old.version + 1;
    new.updated_at := now();
    if new.status is distinct from old.status then
      new.status_changed_at := now();
    end if;
  end if;

  new.search_vector :=
    setweight(to_tsvector('public.fr_unaccent', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('public.fr_unaccent', coalesce(new.tagline, '') || ' ' || new.search_extra), 'B') ||
    setweight(to_tsvector('public.fr_unaccent',
      concat_ws(' ', new.description_text, new.imagined_outcome, new.why, new.benefits, new.first_step)), 'C') ||
    setweight(to_tsvector('public.fr_unaccent', concat_ws(' ', new.where_with, new.place, new.notes)), 'D');

  return new;
end;
$$;

create trigger goals_before_write
  before insert or update on public.goals
  for each row execute function public.goals_before_write();

-- ---------------------------------------------------------------------------
-- Indexes (frequent filters, see docs/plan.md §3.4)
-- ---------------------------------------------------------------------------

create index goals_owner_updated_idx on public.goals (owner_id, updated_at desc) where deleted_at is null;
create index goals_owner_status_idx on public.goals (owner_id, status) where deleted_at is null;
create index goals_owner_horizon_idx on public.goals (owner_id, horizon) where deleted_at is null;
create index goals_owner_energy_idx on public.goals (owner_id, energy) where deleted_at is null;
create index goals_owner_budget_idx on public.goals (owner_id, budget_level) where deleted_at is null;
create index goals_owner_difficulty_idx on public.goals (owner_id, difficulty) where deleted_at is null;
create index goals_to_complete_idx on public.goals (owner_id, updated_at desc)
  where completeness_level = 'sketch' and completion_dismissed_at is null and deleted_at is null;
create index goals_trash_idx on public.goals (deleted_at) where deleted_at is not null;
create index goals_search_idx on public.goals using gin (search_vector);
create index goals_title_trgm_idx on public.goals using gin (title extensions.gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Row Level Security: owner only. Sharing branches are added (closed) in
-- the social migration.
-- ---------------------------------------------------------------------------

-- Anonymous sessions can keep up to 50 wishes (D-030).
create or replace function public.can_create_goal()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not public.is_anonymous()
    or (select count(*) from public.goals g where g.owner_id = auth.uid() and g.deleted_at is null) < 50;
$$;

revoke all on function public.can_create_goal() from public, anon;
grant execute on function public.can_create_goal() to authenticated;

alter table public.goals enable row level security;

create policy goals_select_own on public.goals
  for select to authenticated
  using (owner_id = (select auth.uid()));

create policy goals_insert_own on public.goals
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and (visibility = 'private' or public.app_flag('sharing_enabled'))
    and public.can_create_goal()
  );

create policy goals_update_own on public.goals
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    and (visibility = 'private' or public.app_flag('sharing_enabled'))
  );

create policy goals_delete_own on public.goals
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Used by every child table's policies.
create or replace function public.is_goal_owner(target_goal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.goals g where g.id = target_goal_id and g.owner_id = auth.uid()
  );
$$;

revoke all on function public.is_goal_owner(uuid) from public, anon;
grant execute on function public.is_goal_owner(uuid) to authenticated;
