-- Profiles: one row per auth user, created by trigger.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(btrim(display_name)) between 1 and 40),
  avatar_path text check (char_length(avatar_path) <= 300),
  locale text not null default 'fr' check (locale in ('fr', 'en')),
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  -- Declarations and milestones (timestamps, never booleans: we keep when it happened).
  age_confirmed_at timestamptz,
  privacy_accepted_at timestamptz,
  onboarding_completed_at timestamptz,
  first_goal_celebrated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Minimal profile: pseudo, avatar, language, theme (data minimisation).';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
-- No insert (trigger) and no delete (account deletion goes through the admin module).
