import { describe, expect, it } from 'vitest'
import { AcceptInviteBody, CommentBody, newInviteCode, ReactionBody } from './schema'

describe('friends schema', () => {
  it('makes invite codes the database accepts', () => {
    const code = newInviteCode()
    expect(code).toMatch(/^[A-Za-z0-9_-]{16,64}$/)
    expect(newInviteCode()).not.toBe(code)
    expect(AcceptInviteBody.safeParse({ code }).success).toBe(true)
  })

  it('only knows the three encouragements', () => {
    expect(ReactionBody.safeParse({ kind: 'bravo' }).success).toBe(true)
    expect(ReactionBody.safeParse({ kind: 'boo' }).success).toBe(false)
  })

  it('keeps messages short and never empty', () => {
    expect(CommentBody.safeParse({ body: '   ' }).success).toBe(false)
    expect(CommentBody.safeParse({ body: 'x'.repeat(501) }).success).toBe(false)
    expect(CommentBody.parse({ body: '  Courage !  ' }).body).toBe('Courage !')
  })
})
