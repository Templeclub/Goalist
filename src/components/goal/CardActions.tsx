'use client'

import { Check, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { nextStep, pathSteps, stepIndex } from '@/features/goals/progress'
import type { GoalStatus } from '@/features/goals/schema'
import { Link, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { uuidv7 } from '@/lib/uuid'
import { Button, buttonVariants } from '../ui/Button'
import { motionReduced } from './CardTilt'

type CardActionsProps = { goalId: string; version: number; status: GoalStatus }

type Moment = { kind: 'converted' | 'stored'; previous: GoalStatus; version: number } | null

/** The card turns over (400 ms) as it becomes acquired; nothing moves with fewer animations. */
function flipCard(goalId: string) {
  if (motionReduced()) return
  const card = document.querySelector<HTMLElement>(`[data-card-id="${goalId}"][data-size="hero"]`)
  card?.animate(
    [
      { transform: 'perspective(800px) rotateY(0deg)' },
      { transform: 'perspective(800px) rotateY(90deg)' },
      { transform: 'perspective(800px) rotateY(0deg)' },
    ],
    { duration: 400, easing: 'ease-in-out' },
  )
}

/**
 * Follow a card along its path (D-063): Idée → Confirmée → En préparation → En cours → Acquise.
 * The main button moves it one step; converting only comes at the end. Pausing and putting
 * away are secondary, and every move can be undone.
 */
export function CardActions({ goalId, version: serverVersion, status }: CardActionsProps) {
  const t = useTranslations('goals.detail.actions')
  const tGoal = useTranslations('goal')
  const router = useRouter()
  // Versions only grow: the newest of the server's and the one our last change returned.
  const [localVersion, setVersion] = useState(serverVersion)
  const version = Math.max(serverVersion, localVersion)
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
      body: JSON.stringify({ patch: { status: next }, baseVersion, clientMutationId: uuidv7() }),
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

  const move = async (next: GoalStatus) => {
    const newVersion = await setStatus(next, version)
    if (newVersion === null) return
    if (next === 'done') {
      flipCard(goalId)
      setMoment({ kind: 'converted', previous: status, version: newVersion })
    } else if (next === 'let_go') {
      setMoment({ kind: 'stored', previous: status, version: newVersion })
    }
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

  const current = stepIndex(status)
  const next = nextStep(status)

  return (
    <section
      aria-labelledby="track-title"
      className="grid gap-4 rounded-card border-[3px] border-outline bg-card p-4 shadow-card"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="track-title" className="font-display text-xl font-extrabold">
          {t('track')}
        </h2>
        <p className="text-sm font-extrabold text-ink-2">
          {current !== null
            ? t('stepOf', { current: current + 1, total: pathSteps.length })
            : tGoal(`statuses.${status}`)}
        </p>
      </div>

      <ol className="grid grid-cols-5 gap-1">
        {pathSteps.map((step, i) => {
          const reached = current !== null && i < current
          const here = i === current
          return (
            <li key={step} className="grid justify-items-center gap-1 text-center">
              <button
                type="button"
                disabled={busy || here}
                aria-current={here ? 'step' : undefined}
                aria-label={t('goTo', { step: tGoal(`statuses.${step}`) })}
                onClick={() => void move(step)}
                className={cn(
                  'grid size-11 cursor-pointer place-items-center rounded-full border-[2.5px] border-outline font-display text-base font-extrabold transition-transform disabled:cursor-default',
                  here
                    ? 'bg-accent text-ink-on-accent shadow-card'
                    : reached
                      ? 'bg-gilt text-on-gilt'
                      : 'bg-card text-ink hover:-translate-y-0.5',
                )}
              >
                {reached ? (
                  <Check aria-hidden="true" className="size-5 stroke-[3]" />
                ) : step === 'done' ? (
                  <Star aria-hidden="true" className="size-5 stroke-[2.5]" />
                ) : (
                  i + 1
                )}
              </button>
              <span
                aria-hidden="true"
                className={cn(
                  'text-[0.6875rem] leading-tight font-extrabold',
                  current !== null && i <= current ? 'text-ink' : 'text-ink-3',
                )}
              >
                {tGoal(`statuses.${step}`)}
              </span>
            </li>
          )
        })}
      </ol>
      <div
        aria-hidden="true"
        className="h-2.5 overflow-hidden rounded-full border-2 border-outline bg-paper-2"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-250"
          style={{ width: `${((current ?? 0) / (pathSteps.length - 1)) * 100}%` }}
        />
      </div>

      {status === 'done' ? (
        <Button
          variant="secondary"
          className="justify-self-start"
          disabled={busy}
          onClick={() => void move('in_progress')}
        >
          {t('reopen')}
        </Button>
      ) : status === 'let_go' ? (
        <Button
          variant="secondary"
          className="justify-self-start"
          disabled={busy}
          onClick={() => void move('confirmed')}
        >
          {t('takeOut')}
        </Button>
      ) : (
        <>
          {next && (
            <Button
              block
              disabled={busy}
              onClick={() => void move(next)}
              className={cn(next === 'done' && 'bg-gilt text-on-gilt')}
            >
              {next === 'done'
                ? t('convert')
                : status === 'paused'
                  ? t('resume')
                  : t('advance', { step: tGoal(`statuses.${next}`) })}
            </Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            {status !== 'paused' && (
              <Button
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => void move('paused')}
              >
                {t('pause')}
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              className={cn(status === 'paused' && 'col-span-2')}
              onClick={() => void move('let_go')}
            >
              {t('store')}
            </Button>
          </div>
        </>
      )}
      {failed && (
        <p role="status" className="text-sm text-ink-2">
          {t('failed')}
        </p>
      )}
    </section>
  )
}
