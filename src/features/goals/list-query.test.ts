import { describe, expect, it } from 'vitest'
import { activeFilterCount, hasAnyFilter, listQueryToSearch, parseListQuery } from './list-query'

describe('list query (URL state)', () => {
  it('parses known values and drops unknown ones', () => {
    const q = parseListQuery({
      status: 'idea,done,abandoned',
      difficulty: '1,9',
      quick: 'weekend,nope',
      sort: 'random',
      energy: 'low',
    })
    expect(q.status).toEqual(['idea', 'done'])
    expect(q.difficulty).toEqual([1])
    expect(q.quick).toEqual(['weekend'])
    expect(q.sort).toBe('updated')
    expect(activeFilterCount(q)).toBe(3)
  })

  it('neutralises PostgREST syntax in the search text', () => {
    expect(parseListQuery({ q: 'nuit,(étoile)  "x":*' }).q).toBe('nuit étoile x')
  })

  it('ignores invalid ids', () => {
    expect(
      parseListQuery({ category: 'abc,0192f3a4-7b1c-7d2e-8f3a-123456789abc', open: 'x' }),
    ).toMatchObject({
      category: ['0192f3a4-7b1c-7d2e-8f3a-123456789abc'],
      open: undefined,
    })
  })

  it('round-trips to a minimal query string', () => {
    const q = parseListQuery({ q: 'pain', quick: 'easy_start', sort: 'title' })
    expect(listQueryToSearch(q)).toBe('?q=pain&quick=easy_start&sort=title')
    expect(listQueryToSearch(parseListQuery({}))).toBe('')
    expect(hasAnyFilter(parseListQuery({}))).toBe(false)
  })
})
