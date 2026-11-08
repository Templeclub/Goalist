import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { uuidv7 } from './uuid'

describe('uuidv7', () => {
  it('produces valid version 7 UUIDs', () => {
    const id = uuidv7()
    expect(z.uuid().safeParse(id).success).toBe(true)
    expect(id[14]).toBe('7')
    expect(['8', '9', 'a', 'b']).toContain(id[19])
  })

  it('sorts chronologically', () => {
    const a = uuidv7(1_700_000_000_000)
    const b = uuidv7(1_700_000_000_001)
    expect(a < b).toBe(true)
  })

  it('does not repeat', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => uuidv7(1)))
    expect(ids.size).toBe(1000)
  })
})
