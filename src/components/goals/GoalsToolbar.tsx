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
import { budgetLevels, goalStatuses, horizons, preparations } from '@/features/goals/schema'
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

/**
 * One compact row (D-063): a search that unfolds, the filter sheet (with sort and grouping)
 * and the quick filters. Everything stays in the URL (D-052).
 */
export function GoalsToolbar({ query, categories }: GoalsToolbarProps) {
  const t = useTranslations('goals.list')
  const tGoal = useTranslations('goal')
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [text, setText] = useState(query.q)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const count = activeFilterCount(query) + (query.sort !== 'priority' ? 1 : 0)
  const expanded = focused || text.length > 0

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
      preparation: [],
      horizon: [],
      budget: [],
      category: [],
      sort: 'priority',
      group: 'horizon',
    })
  }

  const categoryLabel = (c: CategoryItem) =>
    c.key ? tGoal(`categories.${c.key}`) : (c.label ?? '')

  return (
    <div className="flex flex-wrap items-center gap-2">
      <form
        role="search"
        onSubmit={(e) => (e.preventDefault(), go({ q: text.trim() }))}
        className={cn(
          'relative transition-[width,flex-basis] duration-200',
          expanded ? 'basis-full' : 'w-12 shrink-0',
        )}
      >
        <label htmlFor={SEARCH_INPUT_ID} className="sr-only">
          {t('search')}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 stroke-[2.5] text-ink"
        />
        <input
          ref={inputRef}
          id={SEARCH_INPUT_ID}
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={expanded ? t('searchPlaceholder') : ''}
          aria-keyshortcuts="/"
          enterKeyHint="search"
          className={cn(
            inputClass,
            'h-12 py-0 pl-11 text-base [&::-webkit-search-cancel-button]:hidden',
            expanded ? 'pr-12' : 'cursor-pointer pr-0 shadow-card',
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

      <Sheet>
        <SheetTrigger asChild>
          <Button size="sm" className="h-12 shrink-0 px-3.5">
            <SlidersHorizontal aria-hidden="true" className="size-4 stroke-[2.5]" />
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
            type="single"
            legend={t('sort.label')}
            options={sorts.map((s) => ({ value: s, label: t(`sort.${s}`) }))}
            value={query.sort}
            onChange={(sort) => sort && go({ sort: sort as Sort })}
          />
          <ChipGroup
            type="single"
            legend={t('group.label')}
            options={groups.map((g) => ({ value: g, label: t(`group.${g}`) }))}
            value={query.group}
            onChange={(group) => group && go({ group: group as Group })}
          />
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
            legend={tGoal('horizon.label')}
            options={horizons.map((h) => ({ value: h, label: tGoal(`horizonShort.${h}`) }))}
            value={query.horizon}
            onChange={(horizon) => go({ horizon })}
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
            legend={tGoal('budget.label')}
            options={budgetLevels.map((b) => ({ value: b, label: tGoal(`budget.${b}`) }))}
            value={query.budget}
            onChange={(budget) => go({ budget })}
          />
        </SheetContent>
      </Sheet>

      <div
        role="group"
        aria-label={t('quick.label')}
        className="-mr-4 flex min-w-0 flex-1 gap-1.5 overflow-x-auto py-1 pr-4 md:mr-0 md:pr-0"
      >
        {quickFilters.map((quick) => (
          <Chip
            key={quick}
            pressed={query.quick.includes(quick)}
            onClick={() => toggleQuick(quick)}
            className="min-h-10 shrink-0 px-3 text-sm whitespace-nowrap"
          >
            {t(`quick.${quick}`)}
          </Chip>
        ))}
      </div>
    </div>
  )
}
