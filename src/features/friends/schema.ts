import { z } from 'zod'

/** Encouragements on a friend's card (D-064): a short, fixed set. */
export const reactionKinds = ['bravo', 'courage', 'inspire'] as const
export type ReactionKind = (typeof reactionKinds)[number]

export const ReactionBody = z.object({ kind: z.enum(reactionKinds) }).strict()
export const CommentBody = z.object({ body: z.string().trim().min(1).max(500) }).strict()
export const OfferBody = z.object({ message: z.string().trim().max(500).optional() }).strict()
export const OfferStatusBody = z
  .object({ status: z.enum(['open', 'accepted', 'declined', 'withdrawn']) })
  .strict()
export const AcceptInviteBody = z
  .object({ code: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/) })
  .strict()

/** A fresh, unguessable invite code (URL-safe). */
export function newInviteCode(): string {
  const bytes = new Uint8Array(18)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
