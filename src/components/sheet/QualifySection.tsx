'use client'

import { BatteryFull, BatteryLow, BatteryMedium, Handshake, User, Users, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import type { Sender } from '@/features/autosave/patch-queue'
import { HttpError } from '@/features/autosave/patch-queue'
import { useAutosave } from '@/features/autosave/use-autosave'
import type { GoalPatch } from '@/features/goals/api-schema'
import { customHues } from '@/features/goals/palette'
import type { CategoryItem, GoalQualify } from '@/features/goals/queries'
import {
  budgetLevels,
  horizons,
  preparations,
  seasons,
  targetPrecisions,
  timeEstimates,
  type BudgetLevel,
  type Energy,
  type Horizon,
  type Mode,
  type Preparation,
  type Season,
  type TimeEstimate,
} from '@/features/goals/schema'
import { cn } from '@/lib/cn'
import { categoryIcon } from '../goal/icons'
import { Button } from '../ui/Button'
import { ChipGroup } from '../ui/ChipGroup'
import { Field, inputClass } from '../ui/Field'
import { IconRadioGroup } from '../ui/IconRadioGroup'
import { StepSelector } from '../ui/StepSelector'
import { HuePicker } from './HuePicker'

type Hue = (typeof customHues)[number]

function putSender<P extends Record<string, unknown>>(
  url: string,
  body: (p: P) => unknown,
): Sender<P> {
  return async (patch, _v, _id, { keepalive }) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body(patch)),
      keepalive,
    })
    if (!response.ok) throw new HttpError(response.status)
    return response.json()
  }
}

type QualifySectionProps = {
  goalId: string
  qualify: GoalQualify
  categories: CategoryItem[]
  selectedCategoryIds: string[]
  tags: string[]
  tagSuggestions: string[]
  /** Goal fields go through the sheet's main autosave queue. */
  onPatch: (patch: GoalPatch) => void
  onCategoriesChange: (selected: CategoryItem[]) => void
}

/** Section 5 — every criterion optional, deselectable, with visual controls (docs/screens/03). */
export function QualifySection({
  goalId,
  qualify: initial,
  categories: initialCategories,
  selectedCategoryIds,
  tags: initialTags,
  tagSuggestions,
  onPatch,
  onCategoriesChange,
}: QualifySectionProps) {
  const t = useTranslations('flow.qualify')
  const tGoal = useTranslations('goal')
  const id = useId()
  const [q, setQ] = useState(initial)
  const [categories, setCategories] = useState(initialCategories)
  const [selected, setSelected] = useState(selectedCategoryIds)
  const [tags, setTags] = useState(initialTags)
  const [tagInput, setTagInput] = useState('')
  const [creating, setCreating] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newHue, setNewHue] = useState<Hue | null>(60)
  const [message, setMessage] = useState<string | null>(null)

  const categoriesQueue = useAutosave<{ ids?: string[] }>({
    send: putSender(`/api/goals/${goalId}/categories`, (p) => ({ ids: p.ids ?? [] })),
    version: 1,
    storageKey: `elan:pending:categories:${goalId}`,
  })
  const tagsQueue = useAutosave<{ labels?: string[] }>({
    send: putSender(`/api/goals/${goalId}/tags`, (p) => ({ labels: p.labels ?? [] })),
    version: 1,
    storageKey: `elan:pending:tags:${goalId}`,
  })

  const set = <K extends keyof GoalQualify>(key: K, value: GoalQualify[K]) => {
    setQ((current) => ({ ...current, [key]: value }))
    onPatch({ [key]: value } as GoalPatch)
  }

  const selectCategories = (ids: string[]) => {
    setSelected(ids)
    categoriesQueue.set('ids', ids)
    onCategoriesChange(
      ids
        .map((cid) => categories.find((c) => c.id === cid))
        .filter((c): c is CategoryItem => Boolean(c)),
    )
  }

  const categoryLabel = (c: CategoryItem) =>
    c.key ? tGoal(`categories.${c.key}`) : (c.label ?? '')

  const createCategory = async () => {
    const label = newLabel.trim()
    if (!label || newHue === null) return
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label, hue: newHue }),
    }).catch(() => null)
    if (response?.status === 409) return setMessage(t('categoryExists'))
    if (!response?.ok) return
    const created = (await response.json()) as { id: string; label: string; hue: number }
    const item: CategoryItem = { id: created.id, key: null, label: created.label, hue: created.hue }
    setCategories((list) => [...list, item])
    selectCategories([...selected, item.id])
    setCreating(false)
    setNewLabel('')
    setMessage(null)
  }

  const addTag = (raw: string) => {
    const label = raw.trim().slice(0, 40)
    if (
      !label ||
      tags.some((tag) => tag.toLowerCase() === label.toLowerCase()) ||
      tags.length >= 20
    )
      return
    const next = [...tags, label]
    setTags(next)
    tagsQueue.set('labels', next)
    setTagInput('')
  }

  const removeTag = (label: string) => {
    const next = tags.filter((tag) => tag !== label)
    setTags(next)
    tagsQueue.set('labels', next)
  }

  const euros = (cents: number | null) => (cents === null ? '' : String(Math.round(cents / 100)))
  const toCents = (value: string) => {
    const n = Number.parseInt(value.replace(/\D/g, ''), 10)
    return Number.isFinite(n) ? n * 100 : null
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="font-display text-xl font-medium">{t('question')}</h1>
        <p className="text-[0.9375rem] text-ink-2">{t('intro')}</p>
      </div>

      <div className="grid gap-3">
        <ChipGroup
          type="multiple"
          legend={t('categories')}
          description={t('categoriesHint')}
          options={categories.map((c) => {
            const Icon = c.key ? categoryIcon[c.key] : categoryIcon.other
            return { value: c.id, label: categoryLabel(c), icon: <Icon /> }
          })}
          value={selected}
          onChange={selectCategories}
        />
        {creating ? (
          <div className="grid gap-3 rounded-md bg-paper-2 p-4">
            <Field id={`${id}-cat`} label={t('newCategoryName')}>
              <input
                id={`${id}-cat`}
                value={newLabel}
                maxLength={40}
                onChange={(e) => setNewLabel(e.target.value)}
                className={inputClass}
              />
            </Field>
            <HuePicker legend={t('newCategoryHue')} value={newHue} onChange={setNewHue} />
            {message && (
              <p role="status" className="text-[0.9375rem] text-accent-strong">
                {message}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!newLabel.trim() || newHue === null}
                onClick={() => void createCategory()}
              >
                {t('createCategory')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
                {tGoal('card.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="justify-self-start"
            onClick={() => setCreating(true)}
          >
            {`+ ${t('newCategory')}`}
          </Button>
        )}
      </div>

      <StepSelector
        legend={tGoal('difficulty.label')}
        steps={([1, 2, 3, 4, 5] as const).map((v) => ({
          value: v,
          label: tGoal(`difficulty.${v}`),
          description: tGoal(`difficulty.description.${v}`),
        }))}
        value={q.difficulty as 1 | 2 | 3 | 4 | 5 | null}
        onChange={(v) => set('difficulty', v)}
      />

      <StepSelector
        legend={tGoal('preparation.label')}
        steps={preparations.map((p) => ({
          value: p,
          label: tGoal(`preparation.${p}`).split(',')[0]!,
          description: tGoal(`preparation.${p}`),
        }))}
        value={q.preparation as Preparation | null}
        onChange={(v) => set('preparation', v)}
      />

      <div className="grid gap-4">
        <ChipGroup
          type="single"
          legend={tGoal('horizon.label')}
          options={horizons.map((h) => ({ value: h, label: tGoal(`horizon.${h}`) }))}
          value={q.horizon as Horizon | null}
          onChange={(v) => set('horizon', v)}
        />
        <Field id={`${id}-date`} label={t('targetDate')} hint={t('targetDateHint')} optional>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id={`${id}-date`}
              type="date"
              value={q.target_date ?? ''}
              aria-describedby={`${id}-date-hint`}
              onChange={(e) => {
                const date = e.target.value || null
                setQ((c) => ({
                  ...c,
                  target_date: date,
                  target_precision: date ? (c.target_precision ?? 'day') : null,
                }))
                onPatch({
                  target_date: date,
                  target_precision: date
                    ? ((q.target_precision as GoalPatch['target_precision']) ?? 'day')
                    : null,
                })
              }}
              className={cn(inputClass, 'w-auto')}
            />
            {q.target_date && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQ((c) => ({ ...c, target_date: null, target_precision: null }))
                  onPatch({ target_date: null, target_precision: null })
                }}
              >
                {t('clearDate')}
              </Button>
            )}
          </div>
        </Field>
        {q.target_date && (
          <ChipGroup
            type="single"
            legend={t('precision')}
            options={targetPrecisions.map((p) => ({ value: p, label: t(`precisions.${p}`) }))}
            value={q.target_precision as (typeof targetPrecisions)[number] | null}
            onChange={(v) => set('target_precision', v ?? 'day')}
          />
        )}
      </div>

      <IconRadioGroup
        legend={tGoal('energy.label')}
        options={[
          { value: 'low', label: tGoal('energy.low'), icon: <BatteryLow /> },
          { value: 'medium', label: tGoal('energy.medium'), icon: <BatteryMedium /> },
          { value: 'high', label: tGoal('energy.high'), icon: <BatteryFull /> },
        ]}
        value={q.energy as Energy | null}
        onChange={(v) => set('energy', v)}
      />

      <div className="grid gap-4">
        <ChipGroup
          type="single"
          legend={tGoal('budget.label')}
          options={budgetLevels.map((b) => ({ value: b, label: tGoal(`budget.${b}`) }))}
          value={q.budget_level as BudgetLevel | null}
          onChange={(v) => set('budget_level', v)}
        />
        {q.budget_level && q.budget_level !== 'none' && (
          <fieldset className="grid gap-2">
            <legend className="mb-2 font-bold">{t('budgetRange')}</legend>
            <div className="flex items-center gap-2">
              <label htmlFor={`${id}-min`} className="text-[0.9375rem] text-ink-2">
                {t('budgetMin')}
              </label>
              <input
                id={`${id}-min`}
                inputMode="numeric"
                value={euros(q.budget_min_cents)}
                onChange={(e) => set('budget_min_cents', toCents(e.target.value))}
                className={cn(inputClass, 'w-28')}
              />
              <label htmlFor={`${id}-max`} className="text-[0.9375rem] text-ink-2">
                {t('budgetMax')}
              </label>
              <input
                id={`${id}-max`}
                inputMode="numeric"
                value={euros(q.budget_max_cents)}
                onChange={(e) => set('budget_max_cents', toCents(e.target.value))}
                className={cn(inputClass, 'w-28')}
              />
              <span aria-hidden="true" className="text-ink-2">
                {'€'}
              </span>
            </div>
          </fieldset>
        )}
      </div>

      <ChipGroup
        type="single"
        legend={tGoal('time.label')}
        options={timeEstimates.map((v) => ({ value: v, label: tGoal(`time.${v}`) }))}
        value={q.time_estimate as TimeEstimate | null}
        onChange={(v) => set('time_estimate', v)}
      />

      <IconRadioGroup
        legend={tGoal('mode.label')}
        options={[
          { value: 'solo', label: tGoal('mode.solo'), icon: <User /> },
          { value: 'together', label: tGoal('mode.together'), icon: <Users /> },
          { value: 'open', label: tGoal('mode.open'), icon: <Handshake /> },
        ]}
        value={q.mode as Mode | null}
        onChange={(v) => set('mode', v)}
      />

      <ChipGroup
        type="multiple"
        legend={tGoal('season.label')}
        options={seasons.map((s) => ({ value: s, label: tGoal(`season.${s}`) }))}
        value={q.seasons as Season[]}
        onChange={(v) => set('seasons', v)}
      />

      <Field id={`${id}-place`} label={t('place')} hint={t('placeHint')} optional>
        <input
          id={`${id}-place`}
          value={q.place ?? ''}
          maxLength={200}
          placeholder={t('placePlaceholder')}
          aria-describedby={`${id}-place-hint`}
          onChange={(e) => {
            setQ((c) => ({ ...c, place: e.target.value }))
            onPatch({ place: e.target.value.trim() || null })
          }}
          className={inputClass}
        />
      </Field>

      <Field id={`${id}-tag`} label={t('tags')} hint={t('tagsHint')} optional>
        <div className="grid gap-2">
          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="inline-flex min-h-9 items-center gap-1 rounded-full bg-paper-2 pr-1 pl-3 text-[0.9375rem]"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={t('removeTag', { tag })}
                    onClick={() => removeTag(tag)}
                    className="grid size-8 cursor-pointer place-items-center rounded-full text-ink-3 hover:bg-card"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <input
            id={`${id}-tag`}
            list={`${id}-tag-list`}
            value={tagInput}
            maxLength={40}
            placeholder={t('tagsPlaceholder')}
            aria-describedby={`${id}-tag-hint`}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault()
                addTag(tagInput)
              }
            }}
            onBlur={() => addTag(tagInput)}
            className={inputClass}
          />
          <datalist id={`${id}-tag-list`}>
            {tagSuggestions
              .filter((s) => !tags.includes(s))
              .map((s) => (
                <option key={s} value={s} />
              ))}
          </datalist>
        </div>
      </Field>
    </div>
  )
}
