import 'server-only'
import { cardColumns, toSummary, type GoalSummary, type Row } from '@/features/goals/queries'
import { RichDoc } from '@/features/goals/rich-text'
import { createClient } from '@/lib/supabase/server'
import type { ReactionKind } from './schema'

export type Friend = { id: string; name: string | null; since: string; sharedCount: number }

/** The viewer's friends (mutual), with how many cards each shares (D-064). */
export async function listFriends(): Promise<Friend[]> {
  const supabase = await createClient()
  const [{ data: friends }, { data: shared }] = await Promise.all([
    supabase.rpc('my_friends'),
    supabase.from('goals').select('owner_id').eq('visibility', 'circle').is('deleted_at', null),
  ])
  const counts = new Map<string, number>()
  for (const g of shared ?? []) counts.set(g.owner_id, (counts.get(g.owner_id) ?? 0) + 1)
  return (friends ?? []).map((f) => ({
    id: f.friend_id,
    name: f.display_name ?? null,
    since: f.since,
    sharedCount: counts.get(f.friend_id) ?? 0,
  }))
}

export type FriendCard = GoalSummary & { ownerId: string; ownerName: string | null }

/** Cards friends shared with the viewer, most recently touched first. */
export async function friendFeed(userId: string, friends: Friend[]): Promise<FriendCard[]> {
  if (friends.length === 0) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goals')
    .select(`${cardColumns}, owner_id`)
    .neq('owner_id', userId)
    .eq('visibility', 'circle')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(60)
  if (error) throw error
  const names = new Map(friends.map((f) => [f.id, f.name]))
  return (data as unknown as (Row & { owner_id: string })[]).map((row) => ({
    ...toSummary(row),
    ownerId: row.owner_id,
    ownerName: names.get(row.owner_id) ?? null,
  }))
}

export type ActivityItem = {
  id: string
  kind: 'reaction' | 'comment' | 'interest' | 'offer'
  reaction?: ReactionKind
  text?: string | null
  at: string
  authorName: string | null
  goal: { id: string; title: string; emoji: string | null }
}

type GoalRef = { id: string; title: string; emoji: string | null; owner_id: string }

/** What friends did on the viewer's cards, newest first. */
export async function myCardsActivity(userId: string, friends: Friend[]): Promise<ActivityItem[]> {
  const supabase = await createClient()
  const goal = 'goals!inner(id, title, emoji, owner_id)'
  const [reactions, comments, interest, offers] = await Promise.all([
    supabase
      .from('reactions')
      .select(`id, kind, created_at, author_id, ${goal}`)
      .eq('goals.owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('comments')
      .select(`id, body, created_at, author_id, ${goal}`)
      .eq('goals.owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('interest_signals')
      .select(`created_at, user_id, ${goal}`)
      .eq('goals.owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('contribution_offers')
      .select(`id, message, created_at, author_id, ${goal}`)
      .eq('goals.owner_id', userId)
      .order('created_at', { ascending: false })
      .limit(20),
  ])
  const names = new Map(friends.map((f) => [f.id, f.name]))
  const ref = (g: unknown) => {
    const r = g as GoalRef
    return { id: r.id, title: r.title, emoji: r.emoji }
  }
  const items: ActivityItem[] = [
    ...(reactions.data ?? []).map((r) => ({
      id: `r-${r.id}`,
      kind: 'reaction' as const,
      reaction: r.kind as ReactionKind,
      at: r.created_at,
      authorName: names.get(r.author_id) ?? null,
      goal: ref(r.goals),
    })),
    ...(comments.data ?? []).map((c) => ({
      id: `c-${c.id}`,
      kind: 'comment' as const,
      text: c.body,
      at: c.created_at,
      authorName: c.author_id ? (names.get(c.author_id) ?? null) : null,
      goal: ref(c.goals),
    })),
    ...(interest.data ?? []).map((i) => ({
      id: `i-${ref(i.goals).id}-${i.user_id}`,
      kind: 'interest' as const,
      at: i.created_at,
      authorName: names.get(i.user_id) ?? null,
      goal: ref(i.goals),
    })),
    ...(offers.data ?? []).map((o) => ({
      id: `o-${o.id}`,
      kind: 'offer' as const,
      text: o.message,
      at: o.created_at,
      authorName: o.author_id ? (names.get(o.author_id) ?? null) : null,
      goal: ref(o.goals),
    })),
  ]
  return items.toSorted((a, b) => b.at.localeCompare(a.at)).slice(0, 20)
}

export type CardComment = {
  id: string
  body: string
  at: string
  authorId: string | null
  authorName: string | null
}
export type CardOffer = {
  id: string
  message: string | null
  status: 'open' | 'accepted' | 'declined' | 'withdrawn'
  at: string
  authorId: string | null
  authorName: string | null
}
export type CardSocial = {
  reactions: Record<ReactionKind, number>
  mine: ReactionKind[]
  comments: CardComment[]
  interestCount: number
  interestedNames: (string | null)[]
  meToo: boolean
  offers: CardOffer[]
}

/** Everything friends said on one card (owner's view or a friend's view; RLS filters). */
export async function cardSocial(
  goalId: string,
  userId: string,
  friends: Friend[],
): Promise<CardSocial> {
  const supabase = await createClient()
  const [reactions, comments, interest, offers] = await Promise.all([
    supabase.from('reactions').select('kind, author_id').eq('goal_id', goalId),
    supabase
      .from('comments')
      .select('id, body, created_at, author_id')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true }),
    supabase.from('interest_signals').select('user_id').eq('goal_id', goalId),
    supabase
      .from('contribution_offers')
      .select('id, message, status, created_at, author_id')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false }),
  ])
  const names = new Map(friends.map((f) => [f.id, f.name]))
  const counts: Record<ReactionKind, number> = { bravo: 0, courage: 0, inspire: 0 }
  const mine: ReactionKind[] = []
  for (const r of reactions.data ?? []) {
    const kind = r.kind as ReactionKind
    if (kind in counts) counts[kind] += 1
    if (r.author_id === userId) mine.push(kind)
  }
  return {
    reactions: counts,
    mine,
    comments: (comments.data ?? []).map((c) => ({
      id: c.id,
      body: c.body,
      at: c.created_at,
      authorId: c.author_id,
      authorName: c.author_id ? (names.get(c.author_id) ?? null) : null,
    })),
    interestCount: interest.data?.length ?? 0,
    interestedNames: (interest.data ?? [])
      .filter((i) => i.user_id !== userId)
      .map((i) => names.get(i.user_id) ?? null),
    meToo: (interest.data ?? []).some((i) => i.user_id === userId),
    offers: (offers.data ?? []).map((o) => ({
      id: o.id,
      message: o.message,
      status: o.status as CardOffer['status'],
      at: o.created_at,
      authorId: o.author_id,
      authorName: o.author_id ? (names.get(o.author_id) ?? null) : null,
    })),
  }
}

export type FriendCardDetail = FriendCard & {
  why: string | null
  firstStep: string | null
  descriptionDoc: RichDoc | null
}

/** A card a friend shared, read-only (null when not visible or when it is the viewer's own). */
export async function getFriendCard(
  goalId: string,
  userId: string,
  friends: Friend[],
): Promise<FriendCardDetail | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('goals')
    .select(`${cardColumns}, owner_id, why, first_step, description_doc`)
    .eq('id', goalId)
    .is('deleted_at', null)
    .maybeSingle()
  if (!data) return null
  const row = data as unknown as Row & {
    owner_id: string
    why: string | null
    first_step: string | null
    description_doc: unknown
  }
  if (row.owner_id === userId) return null
  const doc = RichDoc.safeParse(row.description_doc)
  return {
    ...toSummary(row),
    ownerId: row.owner_id,
    ownerName: friends.find((f) => f.id === row.owner_id)?.name ?? null,
    why: row.why,
    firstStep: row.first_step,
    descriptionDoc: doc.success ? doc.data : null,
  }
}
