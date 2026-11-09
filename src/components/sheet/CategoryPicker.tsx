'use client'

import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import type { Sender } from '@/features/autosave/patch-queue'
import { HttpError } from '@/features/autosave/patch-queue'
import { useAutosave } from '@/features/autosave/use-autosave'
import type { customHues } from '@/features/goals/palette'
import type { CategoryItem } from '@/features/goals/queries'
import { categoryIcon } from '../goal/icons'
import { Button } from '../ui/Button'
import { ChipGroup } from '../ui/ChipGroup'
import { Field, inputClass } from '../ui/Field'
import { HuePicker } from './HuePicker'

type Hue = (typeof customHues)[number]

const categoriesSender =
  (goalId: string): Sender<{ ids?: string[] }> =>
  async (patch, _v, _id, { keepalive }) => {
    const response = await fetch(`/api/goals/${goalId}/categories`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: patch.ids ?? [] }),
      keepalive,
    })
    if (!response.ok) throw new HttpError(response.status)
    return response.json()
  }

type CategoryPickerProps = {
  goalId: string
  categories: CategoryItem[]
  selectedIds: string[]
  onChange: (selected: CategoryItem[]) => void
  /** Injected in stories and tests. */
  send?: Sender<{ ids?: string[] }>
}

/** Categories of a wish, in order: the first one gives the bookmark its colour (D-060). */
export function CategoryPicker({
  goalId,
  categories: initialCategories,
  selectedIds,
  onChange,
  send,
}: CategoryPickerProps) {
  const t = useTranslations('flow.name')
  const tGoal = useTranslations('goal')
  const id = useId()
  const [categories, setCategories] = useState(initialCategories)
  const [selected, setSelected] = useState(selectedIds)
  const [creating, setCreating] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newHue, setNewHue] = useState<Hue | null>(60)
  const [message, setMessage] = useState<string | null>(null)

  const queue = useAutosave<{ ids?: string[] }>({
    send: send ?? categoriesSender(goalId),
    version: 1,
    storageKey: `elan:pending:categories:${goalId}`,
  })

  const select = (ids: string[], list = categories) => {
    setSelected(ids)
    queue.set('ids', ids)
    onChange(
      ids.map((cid) => list.find((c) => c.id === cid)).filter((c): c is CategoryItem => Boolean(c)),
    )
  }

  const label = (c: CategoryItem) => (c.key ? tGoal(`categories.${c.key}`) : (c.label ?? ''))

  const create = async () => {
    const name = newLabel.trim()
    if (!name || newHue === null) return
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: name, hue: newHue }),
    }).catch(() => null)
    if (response?.status === 409) return setMessage(t('categoryExists'))
    if (!response?.ok) return
    const created = (await response.json()) as { id: string; label: string; hue: number }
    const item: CategoryItem = { id: created.id, key: null, label: created.label, hue: created.hue }
    const list = [...categories, item]
    setCategories(list)
    select([...selected, item.id], list)
    setCreating(false)
    setNewLabel('')
    setMessage(null)
  }

  return (
    <div className="grid gap-3">
      <ChipGroup
        type="multiple"
        legend={t('categories')}
        description={t('categoriesHint')}
        options={categories.map((c) => {
          const Icon = c.key ? categoryIcon[c.key] : categoryIcon.other
          return { value: c.id, label: label(c), icon: <Icon /> }
        })}
        value={selected}
        onChange={(ids) => select(ids)}
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
              onClick={() => void create()}
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
  )
}
