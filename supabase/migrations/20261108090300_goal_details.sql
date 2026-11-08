-- Everything that hangs off a goal: categories, tags, values, SMART answers,
-- status history, revisions and inspiration media.

-- ---------------------------------------------------------------------------
-- Categories: 13 system categories (translated by key) + personal ones (D-022)
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles (id) on delete cascade,
  key text check (key in (
    'family', 'social', 'travel', 'practical', 'finance', 'sport_health', 'wellbeing',
    'home', 'learning', 'work', 'volunteering', 'creative', 'other'
  )),
  label text check (char_length(btrim(label)) between 1 and 40),
  icon text check (icon ~ '^[a-z0-9-]{1,40}$'),
  hue smallint check (hue in (0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330)),
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint categories_system_or_personal check (
    (owner_id is null and key is not null and label is null)
    or (owner_id is not null and key is null and label is not null)
  )
);

create unique index categories_system_key_idx on public.categories (key) where owner_id is null;
create unique index categories_personal_label_idx on public.categories (owner_id, lower(label)) where owner_id is not null;

insert into public.categories (key, icon, hue, sort_order) values
  ('family', 'heart-handshake', 0, 1),
  ('social', 'party-popper', 30, 2),
  ('travel', 'tent', 60, 3),
  ('practical', 'list-checks', 90, 4),
  ('finance', 'piggy-bank', 120, 5),
  ('sport_health', 'activity', 150, 6),
  ('wellbeing', 'leaf', 180, 7),
  ('home', 'sofa', 210, 8),
  ('learning', 'lightbulb', 240, 9),
  ('work', 'briefcase', 270, 10),
  ('volunteering', 'hand-heart', 300, 11),
  ('creative', 'palette', 330, 12),
  ('other', 'shapes', null, 13);

alter table public.categories enable row level security;

create policy categories_select on public.categories
  for select to authenticated
  using (owner_id is null or owner_id = (select auth.uid()));

create policy categories_insert_own on public.categories
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy categories_update_own on public.categories
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy categories_delete_own on public.categories
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- A person can hide a system category they never use.
create table public.hidden_categories (
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (owner_id, category_id)
);

alter table public.hidden_categories enable row level security;

create policy hidden_categories_own on public.hidden_categories
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create or replace function public.can_use_category(target_category_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.categories c
    where c.id = target_category_id and (c.owner_id is null or c.owner_id = auth.uid())
  );
$$;

revoke all on function public.can_use_category(uuid) from public, anon;
grant execute on function public.can_use_category(uuid) to authenticated;

create table public.goal_categories (
  goal_id uuid not null references public.goals (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  position smallint not null default 0,
  primary key (goal_id, category_id)
);

create index goal_categories_category_idx on public.goal_categories (category_id, goal_id);

alter table public.goal_categories enable row level security;

create policy goal_categories_select on public.goal_categories
  for select to authenticated
  using (public.is_goal_owner(goal_id));

create policy goal_categories_insert on public.goal_categories
  for insert to authenticated
  with check (public.is_goal_owner(goal_id) and public.can_use_category(category_id));

create policy goal_categories_update on public.goal_categories
  for update to authenticated
  using (public.is_goal_owner(goal_id))
  with check (public.is_goal_owner(goal_id) and public.can_use_category(category_id));

create policy goal_categories_delete on public.goal_categories
  for delete to authenticated
  using (public.is_goal_owner(goal_id));

-- ---------------------------------------------------------------------------
-- Tags (per person, for autocompletion)
-- ---------------------------------------------------------------------------

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  label text not null check (char_length(btrim(label)) between 1 and 40),
  label_normalized text generated always as (lower(btrim(label))) stored,
  created_at timestamptz not null default now(),
  unique (owner_id, label_normalized)
);

alter table public.tags enable row level security;

create policy tags_own on public.tags
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create table public.goal_tags (
  goal_id uuid not null references public.goals (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (goal_id, tag_id)
);

create index goal_tags_tag_idx on public.goal_tags (tag_id, goal_id);

alter table public.goal_tags enable row level security;

create policy goal_tags_select on public.goal_tags
  for select to authenticated
  using (public.is_goal_owner(goal_id));

create policy goal_tags_insert on public.goal_tags
  for insert to authenticated
  with check (
    public.is_goal_owner(goal_id)
    and exists (select 1 from public.tags t where t.id = tag_id and t.owner_id = (select auth.uid()))
  );

create policy goal_tags_delete on public.goal_tags
  for delete to authenticated
  using (public.is_goal_owner(goal_id));

-- ---------------------------------------------------------------------------
-- Values ticked in "Le pourquoi"
-- ---------------------------------------------------------------------------

create table public.goal_values (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  value_key text check (value_key in (
    'freedom', 'learning', 'sharing', 'surpassing', 'relaxing', 'passing_on',
    'wonder', 'health', 'connection', 'creating'
  )),
  custom_label text check (char_length(btrim(custom_label)) between 1 and 40),
  created_at timestamptz not null default now(),
  constraint goal_values_key_or_custom check ((value_key is null) <> (custom_label is null))
);

create unique index goal_values_key_idx on public.goal_values (goal_id, value_key) where value_key is not null;
create unique index goal_values_custom_idx on public.goal_values (goal_id, lower(custom_label)) where custom_label is not null;

alter table public.goal_values enable row level security;

create policy goal_values_own on public.goal_values
  for all to authenticated
  using (public.is_goal_owner(goal_id))
  with check (public.is_goal_owner(goal_id));

-- ---------------------------------------------------------------------------
-- SMART answers (1:1)
-- ---------------------------------------------------------------------------

create table public.smart_answers (
  goal_id uuid primary key references public.goals (id) on delete cascade,
  specific text check (char_length(specific) <= 1000),
  measurable text check (char_length(measurable) <= 1000),
  achievable text check (char_length(achievable) <= 1000),
  obstacle text check (char_length(obstacle) <= 500),
  if_then text check (char_length(if_then) <= 500),
  relevant text check (char_length(relevant) <= 1000),
  time_bound text check (char_length(time_bound) <= 500),
  assembled_sentence text check (char_length(assembled_sentence) <= 1500),
  -- Once the person edits the sentence, it is never overwritten (D-027).
  assembled_edited boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger smart_answers_set_updated_at
  before update on public.smart_answers
  for each row execute function public.set_updated_at();

alter table public.smart_answers enable row level security;

create policy smart_answers_own on public.smart_answers
  for all to authenticated
  using (public.is_goal_owner(goal_id))
  with check (public.is_goal_owner(goal_id));

-- ---------------------------------------------------------------------------
-- Status history (written by trigger only)
-- ---------------------------------------------------------------------------

create table public.goal_status_history (
  id bigint generated always as identity primary key,
  goal_id uuid not null references public.goals (id) on delete cascade,
  from_status text,
  to_status text not null,
  -- Optional word left when changing status (e.g. when letting go).
  note text check (char_length(note) <= 500),
  changed_at timestamptz not null default now()
);

create index goal_status_history_goal_idx on public.goal_status_history (goal_id, changed_at desc);

alter table public.goal_status_history enable row level security;

create policy goal_status_history_select on public.goal_status_history
  for select to authenticated
  using (public.is_goal_owner(goal_id));

create policy goal_status_history_update_note on public.goal_status_history
  for update to authenticated
  using (public.is_goal_owner(goal_id))
  with check (public.is_goal_owner(goal_id));

-- Only the note may change.
revoke update on public.goal_status_history from authenticated;
grant update (note) on public.goal_status_history to authenticated;

create or replace function public.goals_record_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.goal_status_history (goal_id, from_status, to_status)
    values (new.id, null, new.status);
  elsif new.status is distinct from old.status then
    insert into public.goal_status_history (goal_id, from_status, to_status)
    values (new.id, old.status, new.status);
  end if;
  return null;
end;
$$;

revoke all on function public.goals_record_status() from public, anon, authenticated;

create trigger goals_record_status
  after insert or update of status on public.goals
  for each row execute function public.goals_record_status();

-- ---------------------------------------------------------------------------
-- Revisions: grouped snapshots, 50 kept per goal (D-007)
-- ---------------------------------------------------------------------------

create table public.goal_revisions (
  id bigint generated always as identity primary key,
  goal_id uuid not null references public.goals (id) on delete cascade,
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  reason text not null check (reason in ('section_exit', 'review', 'interval', 'restore')),
  created_at timestamptz not null default now()
);

create index goal_revisions_goal_idx on public.goal_revisions (goal_id, created_at desc);

alter table public.goal_revisions enable row level security;

create policy goal_revisions_select on public.goal_revisions
  for select to authenticated
  using (public.is_goal_owner(goal_id));

create policy goal_revisions_insert on public.goal_revisions
  for insert to authenticated
  with check (public.is_goal_owner(goal_id));

create or replace function public.goal_revisions_trim()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.goal_revisions r
  where r.goal_id = new.goal_id
    and r.id not in (
      select id from public.goal_revisions
      where goal_id = new.goal_id
      order by created_at desc, id desc
      limit 50
    );
  return null;
end;
$$;

revoke all on function public.goal_revisions_trim() from public, anon, authenticated;

create trigger goal_revisions_trim
  after insert on public.goal_revisions
  for each row execute function public.goal_revisions_trim();

-- ---------------------------------------------------------------------------
-- Inspiration media: images (private storage) and links
-- ---------------------------------------------------------------------------

create table public.goal_media (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  kind text not null check (kind in ('image', 'link')),
  storage_path text check (char_length(storage_path) <= 300),
  url text check (url ~* '^https?://' and char_length(url) <= 2000),
  title text check (char_length(title) <= 200),
  alt_text text check (char_length(alt_text) <= 300),
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint goal_media_image_or_link check (
    (kind = 'image' and storage_path is not null and url is null)
    or (kind = 'link' and url is not null and storage_path is null)
  )
);

create index goal_media_goal_idx on public.goal_media (goal_id, position);

alter table public.goal_media enable row level security;

create policy goal_media_select on public.goal_media
  for select to authenticated
  using (public.is_goal_owner(goal_id));

create policy goal_media_insert on public.goal_media
  for insert to authenticated
  with check (
    public.is_goal_owner(goal_id)
    and (
      kind = 'link'
      -- Images: not for anonymous sessions, and only inside the person's own folder.
      or (not public.is_anonymous() and storage_path like (select auth.uid())::text || '/%')
    )
  );

create policy goal_media_update on public.goal_media
  for update to authenticated
  using (public.is_goal_owner(goal_id))
  with check (
    public.is_goal_owner(goal_id)
    and (kind = 'link' or storage_path like (select auth.uid())::text || '/%')
  );

create policy goal_media_delete on public.goal_media
  for delete to authenticated
  using (public.is_goal_owner(goal_id));
