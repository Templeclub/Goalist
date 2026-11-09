-- Row Level Security: by default only the owner can see or change anything.
begin;
create extension if not exists pgtap with schema extensions;
select plan(33);

-- ---------------------------------------------------------------------------
-- Fixtures (as the database owner)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('a0000000-0000-4000-8000-000000000001', 'alice@example.test'),
  ('b0000000-0000-4000-8000-000000000002', 'bob@example.test');
insert into auth.users (id, email, is_anonymous) values
  ('c0000000-0000-4000-8000-000000000003', null, true);

-- Act as a given user, like a request carrying their JWT.
create function pg_temp.act_as(uid uuid, anonymous boolean default false) returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', uid, 'role', 'authenticated', 'is_anonymous', anonymous)::text, true);
  execute 'set local role authenticated';
end $$;
grant execute on function pg_temp.act_as(uuid, boolean) to authenticated;

-- pgTAP keeps its state in temp tables owned by the test runner.
grant all on all tables in schema pg_temp to authenticated, anon;
grant all on all sequences in schema pg_temp to authenticated, anon;

select is((select count(*)::int from public.profiles), 3, 'a profile is created for every new user');

-- ---------------------------------------------------------------------------
-- Owner access
-- ---------------------------------------------------------------------------
select pg_temp.act_as('a0000000-0000-4000-8000-000000000001');

select lives_ok(
  $$ insert into public.goals (id, title) values
     ('a1000000-0000-4000-8000-000000000001', 'Dormir une nuit à la belle étoile') $$,
  'Alice can keep a wish with the title only'
);
select is(
  (select owner_id from public.goals where id = 'a1000000-0000-4000-8000-000000000001'),
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'owner_id defaults to the current user'
);
select is((select count(*)::int from public.goals), 1, 'Alice sees her wish');

update public.goals set status = 'confirmed', tagline = 'Voir la Voie lactée'
  where id = 'a1000000-0000-4000-8000-000000000001';
select is(
  (select version from public.goals where id = 'a1000000-0000-4000-8000-000000000001'), 2,
  'version is incremented on update'
);
select is(
  (select count(*)::int from public.goal_status_history where goal_id = 'a1000000-0000-4000-8000-000000000001'), 2,
  'status changes are recorded in the history'
);
select throws_ok(
  $$ update public.goal_status_history set to_status = 'done' $$,
  '42501', null, 'only the note of a status change can be edited'
);
select lives_ok(
  $$ update public.goal_status_history set note = 'Enfin décidé' where to_status = 'confirmed' $$,
  'Alice can leave a word on a status change'
);
select throws_ok(
  $$ update public.goals set owner_id = 'b0000000-0000-4000-8000-000000000002' $$,
  '42501', null, 'a wish cannot be handed to someone else'
);
select is(
  (select count(*)::int from public.goals
   where search_vector @@ websearch_to_tsquery('public.fr_unaccent', 'etoile')),
  1, 'full-text search ignores accents ("etoile" finds "étoile")'
);

select lives_ok(
  $$ insert into public.goal_values (goal_id, value_key) values ('a1000000-0000-4000-8000-000000000001', 'freedom') $$,
  'Alice can tick a value on her wish'
);
select lives_ok(
  $$ insert into public.smart_answers (goal_id, specific) values ('a1000000-0000-4000-8000-000000000001', 'Une nuit sans tente') $$,
  'Alice can write SMART answers'
);
select lives_ok(
  $$ insert into public.goal_categories (goal_id, category_id)
     select 'a1000000-0000-4000-8000-000000000001', id from public.categories where key = 'travel' $$,
  'Alice can use a system category'
);
select throws_ok(
  $$ update public.goals set visibility = 'community' $$,
  '42501', null, 'sharing is refused while the community phase is closed'
);
select lives_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('goal-media', 'a0000000-0000-4000-8000-000000000001/a1000000-0000-4000-8000-000000000001/x.webp') $$,
  'Alice can upload an image into her own folder'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('goal-media', 'b0000000-0000-4000-8000-000000000002/whatever/x.webp') $$,
  '42501', null, 'Alice cannot upload into someone else''s folder'
);
reset role;

-- ---------------------------------------------------------------------------
-- Another person sees and changes nothing
-- ---------------------------------------------------------------------------
insert into public.categories (owner_id, label, hue)
  values ('b0000000-0000-4000-8000-000000000002', 'Rien qu''à moi', 90);

select pg_temp.act_as('b0000000-0000-4000-8000-000000000002');
select is((select count(*)::int from public.goals), 0, 'Bob does not see Alice''s wish');
select is((select count(*)::int from public.goal_values), 0, 'Bob does not see Alice''s values');
select is((select count(*)::int from public.smart_answers), 0, 'Bob does not see Alice''s SMART answers');
select is((select count(*)::int from public.goal_status_history), 0, 'Bob does not see Alice''s status history');
select is((select count(*)::int from storage.objects), 0, 'Bob does not see Alice''s images');
-- Attempts silently match no row under RLS; check the result as the owner.
update public.goals set title = 'pwned';
delete from public.goals;
reset role;
select is(
  (select title from public.goals where id = 'a1000000-0000-4000-8000-000000000001'),
  'Dormir une nuit à la belle étoile', 'Bob cannot change Alice''s wish'
);
select is(
  (select count(*)::int from public.goals where id = 'a1000000-0000-4000-8000-000000000001'), 1,
  'Bob cannot delete Alice''s wish'
);
select pg_temp.act_as('b0000000-0000-4000-8000-000000000002');
select throws_ok(
  $$ insert into public.goals (title, owner_id) values ('Usurpation', 'a0000000-0000-4000-8000-000000000001') $$,
  '42501', null, 'Bob cannot create a wish in Alice''s name'
);
select throws_ok(
  $$ insert into public.goal_values (goal_id, value_key) values ('a1000000-0000-4000-8000-000000000001', 'sharing') $$,
  '42501', null, 'Bob cannot add details to Alice''s wish'
);
select is((select count(*)::int from public.comments), 0, 'community tables are closed');
reset role;

-- Even if a row were marked as shared, it stays invisible while the flag is off.
update public.goals set visibility = 'community' where id = 'a1000000-0000-4000-8000-000000000001';
select pg_temp.act_as('b0000000-0000-4000-8000-000000000002');
select is((select count(*)::int from public.goals), 0, 'a "community" wish stays private while sharing is closed');
reset role;

-- Sharing is open for friends only (D-064): « community » stays closed.
update public.app_flags set enabled = true where key = 'sharing_enabled';
select pg_temp.act_as('b0000000-0000-4000-8000-000000000002');
select is((select count(*)::int from public.goals), 0, 'the community stays closed even with sharing opened (D-064)');
reset role;
select pg_temp.act_as('c0000000-0000-4000-8000-000000000003', true);
select is((select count(*)::int from public.goals), 0, 'anonymous sessions never see community wishes');
reset role;
update public.app_flags set enabled = false where key = 'sharing_enabled';

-- ---------------------------------------------------------------------------
-- Anonymous sessions (first wish before sign-up)
-- ---------------------------------------------------------------------------
select pg_temp.act_as('c0000000-0000-4000-8000-000000000003', true);
select lives_ok(
  $$ insert into public.goals (title) select 'Envie ' || n from generate_series(1, 50) n $$,
  'an anonymous session can keep up to 50 wishes'
);
select throws_ok(
  $$ insert into public.goals (title) values ('Une de trop') $$,
  '42501', null, 'the 51st wish of an anonymous session is refused'
);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('goal-media', 'c0000000-0000-4000-8000-000000000003/g/x.webp') $$,
  '42501', null, 'anonymous sessions cannot upload images'
);
reset role;

-- ---------------------------------------------------------------------------
-- The anon role (no session at all) reads nothing
-- ---------------------------------------------------------------------------
set local role anon;
select is((select count(*)::int from public.goals), 0, 'without a session, nothing is readable');
reset role;

select * from finish();
rollback;
