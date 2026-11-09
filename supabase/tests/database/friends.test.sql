-- Friends (D-064): invites, sharing a card with friends, interactions. RLS only.
begin;
create extension if not exists pgtap with schema extensions;
select plan(39);

insert into auth.users (id, email) values
  ('a0000000-0000-4000-8000-000000000001', 'alice@example.test'),
  ('b0000000-0000-4000-8000-000000000002', 'bob@example.test'),
  ('d0000000-0000-4000-8000-000000000004', 'carol@example.test');
insert into auth.users (id, email, is_anonymous) values
  ('c0000000-0000-4000-8000-000000000003', null, true);
update public.profiles set display_name = 'Alice' where id = 'a0000000-0000-4000-8000-000000000001';

create function pg_temp.act_as(uid uuid, anonymous boolean default false) returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', uid, 'role', 'authenticated', 'is_anonymous', anonymous)::text, true);
  execute 'set local role authenticated';
end $$;
grant execute on function pg_temp.act_as(uuid, boolean) to authenticated;
grant all on all tables in schema pg_temp to authenticated, anon;
grant all on all sequences in schema pg_temp to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Invites
-- ---------------------------------------------------------------------------
select pg_temp.act_as('a0000000-0000-4000-8000-000000000001');
select lives_ok(
  $$ insert into public.friend_invites (owner_id, code)
     values ('a0000000-0000-4000-8000-000000000001', 'alice-invite-code-0001') $$,
  'Alice creates her invite link'
);
insert into public.goals (id, title) values
  ('a1000000-0000-4000-8000-000000000001', 'Dormir à la belle étoile');
insert into public.goal_categories (goal_id, category_id)
  select 'a1000000-0000-4000-8000-000000000001', id from public.categories where key = 'travel';
select throws_ok(
  $$ select public.accept_friend_invite('alice-invite-code-0001') $$,
  '22023', null, 'Alice cannot befriend herself'
);
reset role;

select pg_temp.act_as('c0000000-0000-4000-8000-000000000003', true);
select throws_ok(
  $$ insert into public.friend_invites (owner_id, code)
     values ('c0000000-0000-4000-8000-000000000003', 'anon-invite-code-00001') $$,
  '42501', null, 'a notebook without an account has no invite link'
);
select throws_ok(
  $$ select public.accept_friend_invite('alice-invite-code-0001') $$,
  '42501', null, 'a notebook without an account cannot accept an invite'
);
reset role;

select pg_temp.act_as('b0000000-0000-4000-8000-000000000002');
select is((select count(*)::int from public.friend_invites), 0, 'Bob cannot read Alice''s invite code');
select is(
  (select display_name from public.invite_preview('alice-invite-code-0001')), 'Alice',
  'the invite page shows who sent the link'
);
select throws_ok(
  $$ select public.accept_friend_invite('no-such-invite-code-01') $$,
  'P0002', null, 'an unknown link is refused'
);
select is(
  public.accept_friend_invite('alice-invite-code-0001'),
  'a0000000-0000-4000-8000-000000000001'::uuid,
  'Bob accepts Alice''s link'
);
select lives_ok(
  $$ select public.accept_friend_invite('alice-invite-code-0001') $$,
  'accepting twice changes nothing'
);
select is((select count(*)::int from public.friendships), 1, 'Bob sees his friendship');
select is((select display_name from public.my_friends()), 'Alice', 'Bob''s friends list shows Alice''s pseudo');
reset role;

select pg_temp.act_as('a0000000-0000-4000-8000-000000000001');
select is(
  (select friend_id from public.my_friends()), 'b0000000-0000-4000-8000-000000000002'::uuid,
  'the friendship is mutual'
);
reset role;

select pg_temp.act_as('d0000000-0000-4000-8000-000000000004');
select is((select count(*)::int from public.friendships), 0, 'Carol sees nobody''s friendships');
select is((select count(*)::int from public.my_friends()), 0, 'Carol has no friends listed');
reset role;

-- ---------------------------------------------------------------------------
-- Sharing a card
-- ---------------------------------------------------------------------------
select pg_temp.act_as('b0000000-0000-4000-8000-000000000002');
select is((select count(*)::int from public.goals), 0, 'a private card stays private, even from a friend');
reset role;

select pg_temp.act_as('a0000000-0000-4000-8000-000000000001');
select throws_ok(
  $$ update public.goals set visibility = 'community' $$,
  '42501', null, 'the community stays closed'
);
select lives_ok(
  $$ update public.goals set visibility = 'circle' $$,
  'Alice shares her card with her friends'
);
reset role;

select pg_temp.act_as('b0000000-0000-4000-8000-000000000002');
select is((select count(*)::int from public.goals), 1, 'Bob sees the card Alice shared');
select is((select count(*)::int from public.goal_categories), 1, 'Bob sees its series');
reset role;

select pg_temp.act_as('d0000000-0000-4000-8000-000000000004');
select is((select count(*)::int from public.goals), 0, 'Carol, not a friend, does not see it');
reset role;

select pg_temp.act_as('c0000000-0000-4000-8000-000000000003', true);
select is((select count(*)::int from public.goals), 0, 'an anonymous session does not see it');
reset role;

-- ---------------------------------------------------------------------------
-- Interactions
-- ---------------------------------------------------------------------------
select pg_temp.act_as('b0000000-0000-4000-8000-000000000002');
select lives_ok(
  $$ insert into public.reactions (goal_id, author_id, kind)
     values ('a1000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'bravo') $$,
  'Bob encourages Alice'
);
select throws_ok(
  $$ insert into public.reactions (goal_id, author_id, kind)
     values ('a1000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'boo') $$,
  '23514', null, 'only the known encouragements exist'
);
select lives_ok(
  $$ insert into public.comments (goal_id, author_id, body)
     values ('a1000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'Prends un bon duvet !') $$,
  'Bob leaves a message'
);
select lives_ok(
  $$ insert into public.interest_signals (goal_id, user_id)
     values ('a1000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002') $$,
  'Bob wants it too'
);
select lives_ok(
  $$ insert into public.contribution_offers (goal_id, author_id, message)
     values ('a1000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'Je te prête ma tente') $$,
  'Bob offers his help'
);
select throws_ok(
  $$ update public.contribution_offers set message = 'autre chose' $$,
  '42501', null, 'an offer''s message cannot be rewritten'
);
select throws_ok(
  $$ update public.contribution_offers set status = 'accepted' $$,
  '42501', null, 'only the card''s owner accepts an offer'
);
reset role;

select pg_temp.act_as('d0000000-0000-4000-8000-000000000004');
select throws_ok(
  $$ insert into public.reactions (goal_id, author_id, kind)
     values ('a1000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000004', 'bravo') $$,
  '42501', null, 'Carol cannot react to a card she cannot see'
);
select is((select count(*)::int from public.comments), 0, 'Carol does not see the messages');
select is((select count(*)::int from public.contribution_offers), 0, 'Carol does not see the offers');
reset role;

select pg_temp.act_as('a0000000-0000-4000-8000-000000000001');
select throws_ok(
  $$ insert into public.reactions (goal_id, author_id, kind)
     values ('a1000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'bravo') $$,
  '42501', null, 'Alice does not encourage her own card'
);
select is(
  (select count(*)::int from public.reactions) + (select count(*)::int from public.comments)
    + (select count(*)::int from public.interest_signals) + (select count(*)::int from public.contribution_offers),
  4, 'Alice sees everything her friends did on her card'
);
select lives_ok(
  $$ update public.contribution_offers set status = 'accepted' $$,
  'Alice accepts the help'
);
select lives_ok($$ delete from public.comments $$, 'Alice can remove a message from her card');
select is((select count(*)::int from public.comments), 0, 'the message is gone');
reset role;

-- ---------------------------------------------------------------------------
-- Ending a friendship
-- ---------------------------------------------------------------------------
select pg_temp.act_as('b0000000-0000-4000-8000-000000000002');
delete from public.friendships;
select is((select count(*)::int from public.goals), 0, 'once friends no more, Bob no longer sees the card');
select is((select count(*)::int from public.reactions), 0, 'nor what was said on it');
reset role;

select pg_temp.act_as('a0000000-0000-4000-8000-000000000001');
select is((select count(*)::int from public.my_friends()), 0, 'Alice''s list follows');
reset role;

select * from finish();
rollback;
