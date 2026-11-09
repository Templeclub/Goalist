import { describe, expect, it } from 'vitest'
import { activeFilterCount, hasAnyFilter, listQueryToSearch, parseListQuery } from './list-query'

describe('list query (URL state)', () => {
  it('parses known values and drops unknown ones', () => {
    const q = parseListQuery({
      status: 'idea,done,abandoned',
      horizon: 'short,never',
      quick: 'soon,nope',
      sort: 'random',
      group: 'colour',
    })
    expect(q.status).toEqual(['idea', 'done'])
    expect(q.horizon).toEqual(['short'])
    expect(q.quick).toEqual(['soon'])
    expect(q.sort).toBe('priority')
    expect(q.group).toBe('horizon')
    expect(activeFilterCount(q)).toBe(2)
  })

  it('neutralises PostgREST syntax in the search text', () => {
    expect(parseListQuery({ q: 'nuit,(étoile)  "x":*' }).q).toBe('nuit étoile x')
  })

  it('ignores invalid ids', () => {
    expect(
      parseListQuery({ category: 'abc,0192f3a4-7b1c-7d2e-8f3a-123456789abc' }).category,
    ).toEqual(['0192f3a4-7b1c-7d2e-8f3a-123456789abc'])
  })

  it('round-trips to a minimal query string', () => {
    const q = parseListQuery({ q: 'pain', quick: 'prepare_early', sort: 'title', group: 'none' })
    expect(listQueryToSearch(q)).toBe('?q=pain&quick=prepare_early&sort=title&group=none')
    expect(listQueryToSearch(parseListQuery({}))).toBe('')
    expect(hasAnyFilter(parseListQuery({}))).toBe(false)
  })
})
