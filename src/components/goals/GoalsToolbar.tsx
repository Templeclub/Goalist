'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, useTransition } from 'react'
import type { CategoryItem } from '@/features/goals/queries'
import {
  activeFilterCount,
  groups,
  listQueryToSearch,
  quickFilters,
  sorts,
  type Group,
  type ListQuery,
  type QuickFilter,
  type Sort,
} from '@/features/goals/list-query'
import {
  budgetLevels,
  energies,
  goalStatuses,
  horizons,
  preparations,
} from '@/features/goals/schema'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { categoryIcon } from '../goal/icons'
import { Button } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { ChipGroup } from '../ui/ChipGroup'
import { inputClass } from '../ui/Field'
import { Sheet, SheetContent, SheetTrigger } from '../ui/Sheet'

export const SEARCH_INPUT_ID = 'goals-search'
export const FOCUS_SEARCH_KEY = 'elan:focus-search'

type GoalsToolbarProps = { query: ListQuery; categories: CategoryItem[] }

/** Search, quick filters, filter sheet, sort and grouping — all kept in the URL (D-052). */
export function GoalsToolbar({ query, categories }: GoalsToolbarProps) {
  const t = useTranslations('goals.list')
  const tGoal = useTranslations('goal')
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [text, setText] = useState(query.q)
  const inputRef = useRef<HTMLInputElement>(null)
  const count = activeFilterCount(query)

  const go = (next: Partial<ListQuery>) => {
    const merged = { ...query, ...next }
    startTransition(() => router.replace(`/goals${listQueryToSearch(merged)}`, { scroll: false }))
  }

  // Debounced search as you type.
  useEffect(() => {
    if (text.trim() === query.q) return
    const timer = setTimeout(() => go({ q: text.trim() }), 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  // "/" from another page asks the search field to take focus on arrival.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(FOCUS_SEARCH_KEY)) {
        sessionStorage.removeItem(FOCUS_SEARCH_KEY)
        inputRef.current?.focus()
      }
    } catch {}
  }, [])

  const toggleQuick = (quick: QuickFilter) =>
    go({
      quick: query.quick.includes(quick)
        ? query.quick.filter((q) => q !== quick)
        : [...query.quick, quick],
    })

  const clearAll = () => {
    setText('')
    go({
      q: '',
      quick: [],
      status: [],
      difficulty: [],
      preparation: [],
      horizon: [],
      energy: [],
      budget: [],
      category: [],
    })
  }

  const categoryLabel = (c: CategoryItem) =>
    c.key ? tGoal(`categories.${c.key}`) : (c.label ?? '')

  return (
    <div className="grid gap-3">
      <form
        role="search"
        onSubmit={(e) => (e.preventDefault(), go({ q: text.trim() }))}
        className="relative"
      >
        <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
          {t('search')}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-3"
        />
        <input
          ref={inputRef}
          id={SEARCH_INPUT_ID}
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-keyshortcuts="/"
          enterKeyHint="search"
          className={cn(
            inputClass,
            'pr-12 pl-12 text-base [&::-webkit-search-cancel-button]:hidden',
          )}
        />
        {text && (
          <button
            type="button"
            aria-label={t('clearSearch')}
            onClick={() => {
              setText('')
              go({ q: '' })
              inputRef.current?.focus()
            }}
            className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-ink-3 hover:text-ink"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        )}
      </form>

      <div
        role="group"
        aria-label={t('quick.label')}
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {quickFilters.map((quick) => (
          <Chip
            key={quick}
            pressed={query.quick.includes(quick)}
            onClick={() => toggleQuick(quick)}
            className="shrink-0 whitespace-nowrap"
          >
            {t(`quick.${quick}`)}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="sm">
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              {count > 0 ? t('filtersActive', { count }) : t('filters')}
            </Button>
          </SheetTrigger>
          <SheetContent
            title={t('filtersTitle')}
            footer={
              <div className="flex justify-between gap-2">
                <Button variant="ghost" onClick={clearAll}>
                  {t('clearAll')}
                </Button>
              </div>
            }
          >
            <ChipGroup
              type="multiple"
              legend={t('status')}
              options={goalStatuses.map((s) => ({ value: s, label: tGoal(`statuses.${s}`) }))}
              value={query.status}
              onChange={(status) => go({ status })}
            />
            {categories.length > 0 && (
              <ChipGroup
                type="multiple"
                legend={t('category')}
                options={categories.map((c) => {
                  const Icon = c.key ? categoryIcon[c.key] : categoryIcon.other
                  return { value: c.id, label: categoryLabel(c), icon: <Icon /> }
                })}
                value={query.category}
                onChange={(category) => go({ category })}
              />
            )}
            <ChipGroup
              type="multiple"
              legend={tGoal('difficulty.label')}
              options={(['1', '2', '3', '4', '5'] as const).map((d) => ({
                value: d,
                label: tGoal(`difficulty.${d}`),
              }))}
              value={query.difficulty.map(String) as ('1' | '2' | '3' | '4' | '5')[]}
              onChange={(v) => go({ difficulty: v.map(Number) })}
            />
            <ChipGroup
              type="multiple"
              legend={tGoal('preparation.label')}
              options={preparations.map((p) => ({ value: p, label: tGoal(`preparation.${p}`) }))}
              value={query.preparation}
              onChange={(preparation) => go({ preparation })}
            />
            <ChipGroup
              type="multiple"
              legend={tGoal('horizon.label')}
              options={horizons.map((h) => ({ value: h, label: tGoal(`horizon.${h}`) }))}
              value={query.horizon}
              onChange={(horizon) => go({ horizon })}
            />
            <ChipGroup
              type="multiple"
              legend={tGoal('energy.label')}
              options={energies.map((e) => ({ value: e, label: tGoal(`energy.${e}`) }))}
              value={query.energy}
              onChange={(energy) => go({ energy })}
            />
            <ChipGroup
              type="multiple"
              legend={tGoal('budget.label')}
              options={budgetLevels.map((b) => ({ value: b, label: tGoal(`budget.${b}`) }))}
              value={query.budget}
              onChange={(budget) => go({ budget })}
            />
          </SheetContent>
        </Sheet>

        <label htmlFor="goals-sort" className="sr-only">
          {t('sort.label')}
        </label>
        <select
          id="goals-sort"
          value={query.sort}
          onChange={(e) => go({ sort: e.target.value as Sort })}
          className="min-h-11 cursor-pointer rounded-md border border-line-strong bg-card px-3 text-[0.9375rem] text-ink"
        >
          {sorts.map((s) => (
            <option key={s} value={s}>
              {t(`sort.${s}`)}
            </option>
          ))}
        </select>
        <label htmlFor="goals-group" className="sr-only">
          {t('group.label')}
        </label>
        <select
          id="goals-group"
          value={query.group}
          onChange={(e) => go({ group: e.target.value as Group })}
          className="min-h-11 cursor-pointer rounded-md border border-line-strong bg-card px-3 text-[0.9375rem] text-ink"
        >
          {groups.map((g) => (
            <option key={g} value={g}>
              {g === 'none' ? `${t('group.label')} : ${t('group.none')}` : t(`group.${g}`)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
