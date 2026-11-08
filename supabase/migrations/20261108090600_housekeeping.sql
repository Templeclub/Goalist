-- Housekeeping: trash purge (30 days, D-024) and inactive anonymous sessions (30 days, D-030).

create or replace function public.purge_trashed_goals()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from public.goals where deleted_at < now() - interval '30 days';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

create or replace function public.purge_inactive_anonymous_users()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from auth.users u
  where u.is_anonymous
    and coalesce(u.last_sign_in_at, u.created_at) < now() - interval '30 days';
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.purge_trashed_goals() from public, anon, authenticated;
revoke all on function public.purge_inactive_anonymous_users() from public, anon, authenticated;

-- Schedule with pg_cron when available (always on Supabase; absent on plain Postgres).
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('elan-purge-trash', '17 3 * * *', 'select public.purge_trashed_goals()');
    perform cron.schedule('elan-purge-anonymous', '27 3 * * *', 'select public.purge_inactive_anonymous_users()');
  end if;
end;
$$;
