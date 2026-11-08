-- Foundations: extensions, French search configuration, shared helpers, feature flags.

create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- "reve" finds "rêve": French stemming without accents (D-010).
create text search configuration public.fr_unaccent (copy = pg_catalog.french);
alter text search configuration public.fr_unaccent
  alter mapping for hword, hword_part, word with extensions.unaccent, french_stem;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- True for Supabase anonymous sessions (first wish before sign-up, D-030).
create or replace function public.is_anonymous()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
$$;

-- ---------------------------------------------------------------------------
-- Feature flags (sharing stays closed until the community phase)
-- ---------------------------------------------------------------------------

create table public.app_flags (
  key text primary key check (key ~ '^[a-z_]{2,60}$'),
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

comment on table public.app_flags is 'Server-side feature flags. Read through public.app_flag().';

alter table public.app_flags enable row level security;
-- No policy: only security-definer functions and the service role read it.

insert into public.app_flags (key, enabled) values ('sharing_enabled', false);

create or replace function public.app_flag(flag text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select enabled from public.app_flags where key = flag), false);
$$;

revoke all on function public.app_flag(text) from public;
grant execute on function public.app_flag(text) to authenticated, anon, service_role;
