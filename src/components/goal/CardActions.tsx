'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import type { GoalStatus } from '@/features/goals/schema'
import { Link, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { uuidv7 } from '@/lib/uuid'
import { Button, buttonVariants } from '../ui/Button'

type CardActionsProps = { goalId: string; version: number; status: GoalStatus }

type Moment = { kind: 'converted' | 'stored'; previous: GoalStatus; version: number } | null

/**
 * Convert a card (the wish is done), put it away (let go), or bring it back (D-062).
 * Every move can be undone; a card is never destroyed.
 */
export function CardActions({ goalId, version: initialVersion, status }: CardActionsProps) {
  const t = useTranslations('goals.detail.actions')
  const router = useRouter()
  // Versions only grow: the newest of the server's and the one our last change returned.
  const [localVersion, setVersion] = useState(initialVersion)
  const version = Math.max(initialVersion, localVersion)
  const [moment, setMoment] = useState<Moment>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  // Next keeps a visited page alive but hidden (React Activity), which runs effect cleanups:
  // leaving the page closes the "just converted" moment.
  useEffect(() => () => setMoment(null), [])

  const setStatus = async (next: GoalStatus, baseVersion: number) => {
    setBusy(true)
    setFailed(false)
    const response = await fetch(`/api/goals/${goalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patch: { status: next },
        baseVersion,
        clientMutationId: uuidv7(),
      }),
    }).catch(() => null)
    setBusy(false)
    if (!response?.ok) {
      setFailed(true)
      return null
    }
    const body = (await response.json().catch(() => ({}))) as { version?: number }
    const newVersion = body.version ?? baseVersion + 1
    setVersion(newVersion)
    router.refresh()
    return newVersion
  }

  const move = async (next: GoalStatus, kind?: 'converted' | 'stored') => {
    const newVersion = await setStatus(next, version)
    if (newVersion !== null && kind) setMoment({ kind, previous: status, version: newVersion })
  }

  const undo = async () => {
    if (!moment) return
    const newVersion = await setStatus(moment.previous, moment.version)
    if (newVersion !== null) setMoment(null)
  }

  if (moment) {
    return (
      <div
        className={cn(
          'grid animate-rise gap-3 rounded-card border-[3px] border-outline p-4 shadow-pop',
          moment.kind === 'converted' ? 'bg-acquired' : 'bg-card',
        )}
      >
        <p role="status" className="font-display text-xl font-extrabold">
          {moment.kind === 'converted' ? t('converted') : t('stored')}
        </p>
        <div className="flex flex-wrap gap-2">
          {moment.kind === 'converted' && (
            <Link href="/collection" className={buttonVariants({ size: 'sm' })}>
              {t('seeCollection')}
            </Link>
          )}
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => void undo()}>
            {moment.kind === 'converted' ? t('undoConvert') : t('undoStore')}
          </Button>
        </div>
        {failed && <p className="text-sm text-ink-2">{t('failed')}</p>}
      </div>
    )
  }

  const settled = status === 'done' || status === 'let_go'
  return (
    <div className="grid gap-2">
      {!settled ? (
        <>
          <Button block disabled={busy} onClick={() => void move('done', 'converted')}>
            {t('convert')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-self-center"
            disabled={busy}
            onClick={() => void move('let_go', 'stored')}
          >
            {t('store')}
          </Button>
        </>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          className="justify-self-start"
          disabled={busy}
          onClick={() => void move('confirmed')}
        >
          {status === 'done' ? t('reopen') : t('takeOut')}
        </Button>
      )}
      {failed && (
        <p role="status" className="text-sm text-ink-2">
          {t('failed')}
        </p>
      )}
    </div>
  )
}
