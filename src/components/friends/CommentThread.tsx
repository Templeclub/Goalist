'use client'

import { Trash2 } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { callApi } from '@/features/friends/client-api'
import type { CardComment } from '@/features/friends/queries'
import { cn } from '@/lib/cn'
import { AutoGrowTextarea } from '../ui/AutoGrowTextarea'
import { Button } from '../ui/Button'
import { inputClass } from '../ui/Field'

type CommentThreadProps = {
  goalId: string
  userId: string
  initial: CardComment[]
  /** The card's owner can remove any message; others only their own. */
  canModerate?: boolean
  /** Friends write; the owner reads and moderates. */
  canWrite?: boolean
  api?: typeof callApi
}

/** Short messages on a shared card (D-064). */
export function CommentThread({
  goalId,
  userId,
  initial,
  canModerate = false,
  canWrite = true,
  api = callApi,
}: CommentThreadProps) {
  const t = useTranslations('friends')
  const format = useFormatter()
  const id = useId()
  const [comments, setComments] = useState(initial)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const send = async () => {
    const body = text.trim()
    if (!body) return
    setBusy(true)
    const res = await api<{ id: string; createdAt: string }>(
      `/api/goals/${goalId}/comments`,
      'POST',
      {
        body,
      },
    )
    setBusy(false)
    setFailed(!res)
    if (!res) return
    setComments((c) => [
      ...c,
      { id: res.id, body, at: res.createdAt, authorId: userId, authorName: null },
    ])
    setText('')
  }

  const remove = async (commentId: string) => {
    if (await api(`/api/goals/${goalId}/comments/${commentId}`, 'DELETE'))
      setComments((c) => c.filter((x) => x.id !== commentId))
  }

  return (
    <section aria-labelledby={`${id}-title`} className="grid gap-3">
      <h2 id={`${id}-title`} className="font-display text-xl font-extrabold">
        {t('comments.title')}
      </h2>
      {comments.length === 0 ? (
        <p className="text-[0.9375rem] text-ink-2">{t('comments.empty')}</p>
      ) : (
        <ul className="grid gap-2">
          {comments.map((c) => {
            const mine = c.authorId === userId
            return (
              <li
                key={c.id}
                className={cn(
                  'grid gap-1 rounded-card border-2 border-outline px-3.5 py-2.5',
                  mine ? 'bg-accent-soft' : 'bg-card',
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-extrabold">
                    {mine ? t('you') : (c.authorName ?? t('noName'))}
                    <span className="font-semibold text-ink-3">
                      {' · '}
                      {format.dateTime(new Date(c.at), { dateStyle: 'medium' })}
                    </span>
                  </p>
                  {(mine || canModerate) && (
                    <button
                      type="button"
                      aria-label={t('comments.delete')}
                      onClick={() => void remove(c.id)}
                      className="-my-2 grid size-11 shrink-0 cursor-pointer place-items-center rounded-md text-ink-3 hover:text-ink"
                    >
                      <Trash2 aria-hidden="true" className="size-4" />
                    </button>
                  )}
                </div>
                <p className="text-[0.9375rem] whitespace-pre-line">{c.body}</p>
              </li>
            )
          })}
        </ul>
      )}
      {canWrite && (
        <form onSubmit={(e) => (e.preventDefault(), void send())} className="grid gap-2">
          <label htmlFor={`${id}-text`} className="sr-only">
            {t('comments.label')}
          </label>
          <AutoGrowTextarea
            id={`${id}-text`}
            value={text}
            maxLength={500}
            placeholder={t('comments.placeholder')}
            onChange={(e) => setText(e.target.value)}
            className={inputClass}
          />
          <Button
            type="submit"
            size="sm"
            className="justify-self-end"
            disabled={busy || !text.trim()}
          >
            {t('comments.send')}
          </Button>
          {failed && (
            <p role="status" className="text-sm text-ink-2">
              {t('comments.failed')}
            </p>
          )}
        </form>
      )}
    </section>
  )
}
