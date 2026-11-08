import { describe, expect, it } from 'vitest'
import { CreateGoalBody, GoalPatch, normaliseTitle, PatchGoalBody } from './api-schema'

describe('goal API schemas', () => {
  it('accepts a title-only creation', () => {
    expect(
      CreateGoalBody.safeParse({
        id: '0192f3a4-7b1c-7d2e-8f3a-123456789abc',
        title: 'Apprendre le pain',
      }).success,
    ).toBe(true)
  })

  it('refuses a blank title and unknown fields', () => {
    expect(GoalPatch.safeParse({ title: '  ' }).success).toBe(false)
    expect(GoalPatch.safeParse({ owner_id: 'x' }).success).toBe(false)
    expect(GoalPatch.safeParse({}).success).toBe(false)
  })

  it('lets optional fields be cleared', () => {
    expect(GoalPatch.parse({ tagline: null })).toEqual({ tagline: null })
  })

  it('requires a version and an idempotency key', () => {
    expect(PatchGoalBody.safeParse({ patch: { title: 'A' } }).success).toBe(false)
  })

  it('normalises the express title', () => {
    expect(normaliseTitle('  Dormir   une nuit\n à la belle étoile ')).toBe(
      'Dormir une nuit à la belle étoile',
    )
    expect(normaliseTitle('x'.repeat(200))).toHaveLength(120)
  })
})
