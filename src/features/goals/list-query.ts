import { z } from 'zod'
import { budgetLevels, goalStatuses, horizons, preparations } from './schema'

/** The list state lives in the URL (docs/screens/05, D-052). */
export const quickFilters = ['soon', 'prepare_early', 'no_budget', 'to_complete'] as const
export const sorts = ['priority', 'updated', 'created', 'title'] as const
export const groups = ['none', 'status', 'horizon', 'category'] as const

export type QuickFilter = (typeof quickFilters)[number]
export type Sort = (typeof sorts)[number]
export type Group = (typeof groups)[number]

const csv = <T extends readonly string[]>(values: T) =>
  z
    .string()
    .optional()
    .transform((raw) =>
      (raw ?? '')
        .split(',')
        .filter((v): v is T[number] => (values as readonly string[]).includes(v)),
    )

const listSchema = z.object({
  q: z
    .string()
    .optional()
    // PostgREST filter syntax characters are never needed in a search.
    .transform((v) =>
      (v ?? '')
        .replace(/[,()"'\\:*%{}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100),
    ),
  quick: csv(quickFilters),
  status: csv(goalStatuses),
  preparation: csv(preparations),
  horizon: csv(horizons),
  budget: csv(budgetLevels),
  category: z
    .string()
    .optional()
    .transform((raw) =>
      (raw ?? '')
        .split(',')
        .filter((v) => z.uuid().safeParse(v).success)
        .slice(0, 20),
    ),
  sort: z.enum(sorts).catch('priority').default('priority'),
  group: z.enum(groups).catch('horizon').default('horizon'),
})

export type ListQuery = z.infer<typeof listSchema>

type Params = Record<string, string | string[] | undefined>

export function parseListQuery(params: Params): ListQuery {
  const flat = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v]),
  )
  return listSchema.parse(flat)
}

/** Count of filters behind the "Filtres" button (quick filters are visible on their own). */
export function activeFilterCount(q: ListQuery) {
  return [q.status, q.preparation, q.horizon, q.budget, q.category].filter((v) => v.length > 0)
    .length
}

export function hasAnyFilter(q: ListQuery) {
  return Boolean(q.q) || q.quick.length > 0 || activeFilterCount(q) > 0
}

/** Serialises back to a query string, omitting defaults. */
export function listQueryToSearch(q: Partial<ListQuery>): string {
  const params = new URLSearchParams()
  if (q.q) params.set('q', q.q)
  for (const key of ['quick', 'status', 'preparation', 'horizon', 'budget', 'category'] as const) {
    const value = q[key] as readonly (string | number)[] | undefined
    if (value && value.length > 0) params.set(key, value.join(','))
  }
  if (q.sort && q.sort !== 'priority') params.set('sort', q.sort)
  if (q.group && q.group !== 'horizon') params.set('group', q.group)
  const s = params.toString()
  return s ? `?${s}` : ''
}

/** PostgREST `or` expressions for the quick filters (all ANDed together). */
export const quickFilterExpression: Record<QuickFilter, string> = {
  soon: 'horizon.eq.short',
  prepare_early: 'and(preparation.in.(heavy,very_heavy),horizon.neq.someday)',
  no_budget: 'budget_level.eq.none',
  to_complete: 'and(completeness_level.eq.sketch,completion_dismissed_at.is.null)',
}
