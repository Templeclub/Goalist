-- Data rules: only the title is required, enumerations are closed, housekeeping works.
begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

insert into auth.users (id, email) values ('a0000000-0000-4000-8000-000000000001', 'alice@example.test');

select lives_ok(
  $$ insert into public.goals (id, owner_id, title)
     values ('a1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Apprendre le violoncelle') $$,
  'a title is enough'
);
select throws_ok(
  $$ insert into public.goals (owner_id, title) values ('a0000000-0000-4000-8000-000000000001', '   ') $$,
  '23514', null, 'a blank title is refused'
);
select throws_ok(
  $$ update public.goals set status = 'abandoned' $$,
  '23514', null, 'statuses are a closed list'
);
select throws_ok(
  $$ update public.goals set difficulty = 6 $$,
  '23514', null, 'difficulty goes from 1 to 5'
);
select throws_ok(
  $$ update public.goals set seasons = array['monsoon'] $$,
  '23514', null, 'seasons are a closed list'
);
select throws_ok(
  $$ update public.goals set target_precision = 'month' $$,
  '23514', null, 'a date precision needs a date'
);
select throws_ok(
  $$ update public.goals set budget_min_cents = 5000, budget_max_cents = 1000 $$,
  '23514', null, 'a budget range must be ordered'
);
select is(
  (select count(*)::int from public.categories where owner_id is null), 13,
  'the 13 system categories are seeded'
);

-- Revisions are trimmed to the 50 most recent.
insert into public.goal_revisions (goal_id, snapshot, reason)
select 'a1000000-0000-4000-8000-000000000001', jsonb_build_object('n', n), 'interval'
from generate_series(1, 55) n;
select is(
  (select count(*)::int from public.goal_revisions), 50,
  'only the 50 most recent revisions are kept'
);

-- Trash purge after 30 days.
insert into public.goals (owner_id, title, deleted_at)
values ('a0000000-0000-4000-8000-000000000001', 'Mise de côté il y a longtemps', now() - interval '31 days');
select is(public.purge_trashed_goals(), 1, 'wishes in the trash for more than 30 days are purged');

-- Inactive anonymous sessions are purged with their data.
insert into auth.users (id, is_anonymous, created_at)
values ('c0000000-0000-4000-8000-000000000003', true, now() - interval '40 days');
select is(public.purge_inactive_anonymous_users(), 1, 'anonymous sessions inactive for 30 days are purged');

-- Deleting an account removes everything in cascade.
delete from auth.users where id = 'a0000000-0000-4000-8000-000000000001';
select is(
  (select count(*)::int from public.goals) + (select count(*)::int from public.goal_revisions)
    + (select count(*)::int from public.goal_status_history) + (select count(*)::int from public.profiles),
  0, 'deleting an account deletes all of its data'
);

select * from finish();
rollback;
