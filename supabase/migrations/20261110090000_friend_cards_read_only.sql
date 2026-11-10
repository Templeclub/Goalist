-- Friends see shared cards, never as their own (D-066).
-- Until now a friend read a shared card straight from public.goals (RLS), so every query of
-- « my notebook » (Mes cartes, accueil, collection, export, a card's page) also returned the
-- friends' cards, opened in the editor. The two views are now split at the source:
--   * public.goals (and every table hanging off it) is readable by its owner only;
--   * friends read shared cards through friend_cards(), read-only and limited to the
--     columns a friend may see (title, why, first step, description, characteristics, series).

drop policy goals_select on public.goals;

create policy goals_select_own on public.goals
  for select to authenticated
  using (owner_id = (select auth.uid()));

drop policy goal_categories_select_shared on public.goal_categories;

-- Cards shared with the viewer by friends, newest first. Optionally one friend's, or one card.
create or replace function public.friend_cards(
  only_owner uuid default null,
  only_goal uuid default null
)
returns table (
  id uuid,
  owner_id uuid,
  title text,
  tagline text,
  emoji text,
  hue smallint,
  horizon text,
  preparation text,
  budget_level text,
  first_step text,
  why text,
  description_doc jsonb,
  status text,
  status_changed_at timestamptz,
  completeness_level text,
  missing_sections text[],
  updated_at timestamptz,
  created_at timestamptz,
  version integer,
  categories jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    g.id, g.owner_id, g.title, g.tagline, g.emoji, g.hue, g.horizon, g.preparation,
    g.budget_level, g.first_step, g.why, g.description_doc, g.status, g.status_changed_at,
    g.completeness_level, g.missing_sections, g.updated_at, g.created_at, g.version,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('position', gc.position, 'key', c.key, 'label', c.label, 'hue', c.hue)
          order by gc.position
        )
        from public.goal_categories gc
        join public.categories c on c.id = gc.category_id
        where gc.goal_id = g.id
      ),
      '[]'::jsonb
    )
  from public.goals g
  where g.deleted_at is null
    and g.visibility = 'circle'
    and g.owner_id <> auth.uid()
    and (only_owner is null or g.owner_id = only_owner)
    and (only_goal is null or g.id = only_goal)
    and public.goal_shared_with_me(g.owner_id, g.visibility)
  order by g.updated_at desc
  limit 200;
$$;

revoke all on function public.friend_cards(uuid, uuid) from public, anon;
grant execute on function public.friend_cards(uuid, uuid) to authenticated;
